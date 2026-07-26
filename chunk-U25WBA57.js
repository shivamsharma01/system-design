import{a as e}from"./chunk-Q736PTLB.js";import"./chunk-IFGU66OU.js";var r={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`A **forward (client) proxy** acts on behalf of **clients**. A **reverse proxy** acts on behalf of **servers**. Same middlebox idea, opposite direction of trust.

Not the GoF [Proxy pattern](/designs/proxy) (OOP wrapper) \u2014 this page is about **network proxies**. Related: [Load Balancing](/designs/load-balancing-pattern), [API Gateway](/designs/api-gateway), [CDN](/designs/cdn).`},{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/01-overview.png",alt:"Forward proxy in front of clients versus reverse proxy in front of servers",caption:"Client-side vs server-side intermediary. Diagram adapted from Ashish Pratap Singh / AlgoMaster."}]},{id:"forward-proxy",title:"Forward Proxy",blocks:[{type:"markdown",value:"Clients send traffic **to the proxy**; the proxy talks to the internet. Origins see the proxy\u2019s IP, not the user\u2019s."},{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/02-forward-proxy.png",alt:"Forward proxy intercepting client requests before they reach the internet",caption:"Browser \u2192 proxy \u2192 origin. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`**Flow:** (1) user requests URL \u2192 (2) proxy may allow/deny/filter \u2192 (3) proxy fetches origin \u2192 (4) relays response.

**Benefits:** privacy/anonymity, corporate access control, malware filtering, response caching.

**VPN vs proxy:** a VPN tunnels **all** (or most) traffic at the network layer; a proxy typically handles **application** traffic (HTTP/HTTPS) for configured apps.`},{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/03-forward-use-cases.png",alt:"Forward proxy use cases such as geo bypass and caching",caption:"Geo bypass, caching, and policy enforcement. Diagram adapted from Ashish Pratap Singh / AlgoMaster."}]},{id:"reverse-proxy",title:"Reverse Proxy",blocks:[{type:"markdown",value:"Clients hit a public hostname that resolves to the **reverse proxy**. The proxy routes to internal backends; clients never talk to app servers directly."},{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/04-reverse-proxy.png",alt:"Reverse proxy sitting in front of backend application servers",caption:"Internet \u2192 reverse proxy \u2192 backends. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/05-reverse-flow.png",alt:"Request flow through a reverse proxy with load balancing rules",caption:"Route by rules, then relay the response. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"bestPractices",title:"Reverse proxy benefits",practices:["**Load balancing** across app instances.","**Hide** internal topology and IPs.","**Cache** static assets at the edge of the app tier.","**SSL/TLS termination** \u2014 decrypt once at the proxy.","**WAF** / request filtering before apps see traffic."]}]},{id:"comparison",title:"Summary Comparison",blocks:[{type:"image",src:"assets/article-images/proxy-vs-reverse-proxy/06-comparison.png",alt:"Side-by-side comparison of forward proxy and reverse proxy",caption:"Who they protect and where they sit. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"featureComparison",caption:"Forward vs reverse.",columns:["Forward proxy","Reverse proxy"],rows:[{feature:"Acts for",values:["Clients","Servers"]},{feature:"Configured by",values:["Client / corp IT","Server operators"]},{feature:"Typical goals",values:["Privacy, filter, cache","LB, TLS, WAF, cache"]},{feature:"Examples",values:["Squid, corp HTTP proxy","Nginx, HAProxy, Cloudflare"]}]}]},{id:"java-spring",title:"Nginx / Spring Notes",blocks:[{type:"code",language:"bash",filename:"reverse-proxy.conf",code:`# Nginx reverse proxy (TLS terminate + least_conn upstream)
server {
  listen 443 ssl;
  server_name api.example.com;
  ssl_certificate     /etc/certs/fullchain.pem;
  ssl_certificate_key /etc/certs/privkey.pem;

  location / {
    proxy_pass http://app_upstream;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

upstream app_upstream {
  least_conn;
  server 10.0.1.10:8080;
  server 10.0.1.11:8080;
}`},{type:"markdown",value:"In Spring Boot behind a reverse proxy, trust forwarded headers (`server.forward-headers-strategy=native` or `ForwardedHeaderFilter`) so redirects and absolute URLs use the public scheme/host. [Spring Cloud Gateway](/designs/api-gateway) is itself a reverse-proxy-style edge."}]},{id:"source",title:"Source",blocks:[{type:"callout",variant:"note",title:"Source",body:"Summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CProxy vs Reverse Proxy (Explained with Examples),\u201D with Nginx/Spring notes for this platform."}]}]},s=r;export{s as default};
