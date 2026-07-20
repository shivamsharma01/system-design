import{a as e}from"./chunk-MNAWRFW5.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"Five production-oriented SQL interview patterns using **PostgreSQL-style syntax**. The focus is not memorizing queries\u2014it is recognizing ranking, sequence, cumulative-state, gaps-and-islands, and index-access problems."},{type:"callout",variant:"tip",title:"How to answer",body:"Explain the data grain first, choose a deterministic window order, state tie/boundary semantics, then validate the execution plan with `EXPLAIN ANALYZE` on production-like data."}]},{id:"advanced-sql-sketchnotes",title:"Advanced SQL Sketchnotes",blocks:[{type:"sketchnote",title:"Five SQL Patterns Worth Knowing",intro:"Window functions express ranking, sequence, and cumulative state without repeated self-joins.",items:[{code:"SQL-1",glyph:"#",title:"N-th highest salary",subtitle:"Rank distinct salary values without gaps",points:["DENSE_RANK gives equal salaries the same rank","Ranks continue 1, 2, 3\u2014no gaps after ties","Filter the ranked result by requested N"],tip:"ROW_NUMBER ranks employees; DENSE_RANK ranks salary levels."},{code:"SQL-2",glyph:"30m",title:"Sessionize events",subtitle:"New session after inactivity",points:["LAG reads the previous event per user","Mark a boundary when the gap exceeds 30 minutes","Cumulative SUM turns boundaries into session IDs"],tip:"Add event_id to make equal timestamps deterministic."},{code:"SQL-3",glyph:"%",title:"YoY + running total",subtitle:"Aggregate once, compare adjacent years",points:["CTE computes one row per year","LAG supplies previous-year revenue","SUM OVER computes cumulative revenue"],tip:"NULLIF(previous, 0) prevents divide-by-zero."},{code:"SQL-4",glyph:"5d",title:"Consecutive login streak",subtitle:"Gaps and Islands",points:["Deduplicate to one login per user/day","Subtract ROW_NUMBER days from each date","Consecutive dates share an island key"],tip:"Keep islands whose day count is at least five."},{code:"SQL-5",glyph:"Ix",title:"SARGable predicates",subtitle:"Let indexes search\u2014not calculate each row",points:["Functions on indexed columns often block normal index seeks","Rewrite as ranges or raw-column comparisons","Use an expression index when rewriting is impossible"],tip:"Confirm with EXPLAIN ANALYZE; a function is a risk, not automatic proof of slowness."}]}]},{id:"nth-highest-salary",title:"1. N-th Highest Salary Without Gaps",blocks:[{type:"code",language:"sql",filename:"nth_highest_salary.sql",showLineNumbers:!0,code:`WITH ranked AS (
  SELECT
    employee_id,
    employee_name,
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
  FROM employees
  WHERE salary IS NOT NULL
)
SELECT employee_id, employee_name, salary
FROM ranked
WHERE salary_rank = :n;`},{type:"callout",variant:"info",title:"Why DENSE_RANK?",body:"`DENSE_RANK()` assigns the same rank to salary ties and leaves no gaps. A correlated `COUNT(DISTINCT salary)` can be logically correct, but it expresses repeated comparison and is harder to extend. The window query states the ranking intent directly and commonly needs one ordered window operation."}]},{id:"sessionization",title:"2. User Sessions with a 30-Minute Gap",blocks:[{type:"code",language:"sql",filename:"sessionize_events.sql",showLineNumbers:!0,code:`WITH ordered AS (
  SELECT
    event_id,
    user_id,
    event_time,
    LAG(event_time) OVER (
      PARTITION BY user_id
      ORDER BY event_time, event_id
    ) AS previous_event_time
  FROM user_events
),
boundaries AS (
  SELECT *,
    CASE
      WHEN previous_event_time IS NULL
        OR event_time > previous_event_time + INTERVAL '30 minutes'
      THEN 1 ELSE 0
    END AS starts_new_session
  FROM ordered
),
sessionized AS (
  SELECT *,
    SUM(starts_new_session) OVER (
      PARTITION BY user_id
      ORDER BY event_time, event_id
      ROWS UNBOUNDED PRECEDING
    ) AS session_number
  FROM boundaries
)
SELECT
  user_id,
  session_number,
  MIN(event_time) AS session_start,
  MAX(event_time) AS session_end,
  COUNT(*) AS event_count
FROM sessionized
GROUP BY user_id, session_number;`},{type:"callout",variant:"note",title:"Boundary semantics",body:"This query starts a new session when inactivity is **greater than** 30 minutes. Change `>` to `>=` if exactly 30 minutes should start a new session. Index `(user_id, event_time, event_id)` to support the partition/order access pattern."}]},{id:"yoy-running-total",title:"3. YoY Growth and Running Totals",blocks:[{type:"code",language:"sql",filename:"yoy_and_running_total.sql",showLineNumbers:!0,code:`WITH annual AS (
  SELECT
    EXTRACT(YEAR FROM order_date)::int AS year,
    SUM(revenue) AS revenue
  FROM orders
  GROUP BY EXTRACT(YEAR FROM order_date)::int
),
compared AS (
  SELECT
    year,
    revenue,
    LAG(revenue) OVER (ORDER BY year) AS previous_year_revenue,
    SUM(revenue) OVER (
      ORDER BY year
      ROWS UNBOUNDED PRECEDING
    ) AS running_revenue
  FROM annual
)
SELECT
  year,
  revenue,
  previous_year_revenue,
  ROUND(
    100.0 * (revenue - previous_year_revenue)
    / NULLIF(previous_year_revenue, 0),
    2
  ) AS yoy_growth_percent,
  running_revenue
FROM compared
ORDER BY year;`},{type:"callout",variant:"info",title:"Why this shape?",body:"Aggregate to the reporting grain once, then use `LAG` and windowed `SUM` over that small annual result. This is clearer than multiple self-joins and prevents detail rows from being multiplied accidentally."}]},{id:"login-streak",title:"4. Five-Day Consecutive Login Streak",blocks:[{type:"code",language:"sql",filename:"five_day_login_streak.sql",showLineNumbers:!0,code:`WITH login_days AS (
  SELECT DISTINCT user_id, login_at::date AS login_day
  FROM logins
),
numbered AS (
  SELECT
    user_id,
    login_day,
    login_day
      - ROW_NUMBER() OVER (
          PARTITION BY user_id ORDER BY login_day
        ) * INTERVAL '1 day' AS island_key
  FROM login_days
)
SELECT
  user_id,
  MIN(login_day) AS streak_start,
  MAX(login_day) AS streak_end,
  COUNT(*) AS streak_days
FROM numbered
GROUP BY user_id, island_key
HAVING COUNT(*) >= 5
ORDER BY user_id, streak_start;`},{type:"callout",variant:"info",title:"Gaps and Islands",body:"For consecutive dates, `date - row_number \xD7 one day` stays constant. That constant identifies an island. Deduplicating by user/day first prevents several logins on one day from inflating the streak."}]},{id:"sargability",title:"5. Functions in WHERE and SARGability",blocks:[{type:"code",language:"sql",filename:"sargable_predicates.sql",showLineNumbers:!0,code:`-- Non-SARGable for a normal index on balance:
SELECT * FROM accounts WHERE ABS(balance) > 1000;

-- SARGable equivalent:
SELECT *
FROM accounts
WHERE balance > 1000 OR balance < -1000;

-- Avoid wrapping an indexed timestamp:
SELECT * FROM orders WHERE DATE(created_at) = DATE '2026-07-19';

-- Prefer a half-open range:
SELECT *
FROM orders
WHERE created_at >= TIMESTAMP '2026-07-19 00:00:00'
  AND created_at <  TIMESTAMP '2026-07-20 00:00:00';

-- If the expression is the real access pattern:
CREATE INDEX idx_accounts_abs_balance ON accounts ((ABS(balance)));`},{type:"callout",variant:"warning",title:"Why functions can be slow",body:"A normal B-tree stores the original column value, not `ABS(column)` or `DATE(column)`. The database may have to evaluate the function for many rows instead of seeking into the normal index. Rewrite the predicate or create a matching expression index, then verify the chosen plan."}]}]},a=t;export{a as default};
