import{a as e}from"./chunk-HI7BFRWU.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`A **JSON Web Token (JWT)** is an open standard for securely transmitting claims between a client and a server. The token is **digitally signed** so the receiver can trust it was not tampered with. Unlike classic **server-side sessions**, a JWT carries user claims inside the token itself\u2014the server verifies the signature instead of looking up shared session state.

That makes JWTs a natural fit for scalable APIs and microservices that must not depend on sticky sessions or a central session store for every request.`},{type:"callout",variant:"info",title:"Why teams adopt JWT",body:"**Stateless** auth, **horizontal scale** without shared session memory, **custom claims** (roles, tenant), often faster than a DB session lookup, and easy to send in an HTTP header across domains. OAuth 2.0 is the *framework* for obtaining tokens; JWT is a common *token format*\u2014see [Spring Boot security basics](/designs/spring-boot-interview#security-basics)."}]},{id:"sessions-vs-jwt",title:"Sessions vs JWT",blocks:[{type:"markdown",value:"Traditional flow: login \u2192 server creates a session and stores it \u2192 client keeps a **session ID** cookie \u2192 every request looks up that ID. Simple for monoliths; painful when many servers need a shared session store."},{type:"image",src:"assets/article-images/jwt/01-session-based-auth.png",alt:"Session-based authentication: login, create session in session store, send session ID cookie, include ID on later requests",caption:"Session-based auth requires a shared session store across app instances. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:"JWT flow: login \u2192 server signs claims into a token \u2192 client stores the token \u2192 later requests send `Authorization: Bearer <token>` \u2192 server verifies signature and expiry. No per-request session lookup."}]},{id:"anatomy",title:"Anatomy of a JWT",blocks:[{type:"markdown",value:"A JWT has three Base64Url-encoded parts separated by dots:\n\n```\nheader.payload.signature\n```"},{type:"image",src:"assets/article-images/jwt/03-jwt-anatomy.png",alt:"JWT debugger showing encoded token split into header, payload, and signature with decoded JSON claims",caption:"Header (alg/typ), payload (claims), and signature. The payload is encoded, not encrypted\u2014anyone can read it. Diagram adapted from Ashish Pratap Singh / AlgoMaster (jwt.io style)."},{type:"markdown",value:'**Header** \u2014 metadata, e.g. `{"alg":"HS256","typ":"JWT"}`. Algorithms: **HS256** (shared secret), **RS256**/**ES256** (asymmetric keys).\n\n**Payload** \u2014 claims:\n\n- **Registered:** `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`\n- **Public:** namespaced custom claims\n- **Private:** app-specific (`userId`, `roles`, `tenantId`)\n\n**Signature** \u2014 `HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)` (or RSA/ECDSA with a private key). Proves integrity and authenticity.'},{type:"callout",variant:"warning",title:"Encoded \u2260 encrypted",body:"Never put passwords, card numbers, or secrets in the payload. Treat JWTs as readable by anyone who intercepts them\u2014always use **HTTPS**."}]},{id:"how-it-works",title:"How JWT authentication works",blocks:[{type:"image",src:"assets/article-images/jwt/04-jwt-auth-flow.png",alt:"JWT auth flow from login and token issuance through Bearer requests and signature verification",caption:"Login \u2192 sign JWT \u2192 client stores token \u2192 Bearer on each request \u2192 verify signature and claims. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:"1. **Login** \u2014 `POST /login` with credentials (or social token).\n2. **Issue** \u2014 if valid, sign claims (`userId`, `role`, `exp`).\n3. **Store** \u2014 client keeps the token (prefer memory + HttpOnly refresh cookie over localStorage).\n4. **Call APIs** \u2014 `Authorization: Bearer <JWT>`.\n5. **Verify** \u2014 extract token, check signature, `exp`/`nbf`/`aud`/`iss`; grant access or return **401**/**403**."},{type:"code",language:"javascript",filename:"issue-token.js",code:`const token = jwt.sign(
  { userId: 123, role: 'admin' },
  SECRET_KEY,
  { expiresIn: '1h' }
);
// Client later: Authorization: Bearer <token>`}]},{id:"security",title:"Security considerations",blocks:[{type:"markdown",value:"- **Always HTTPS** \u2014 tokens in transit are credentials.\n- **Protect secrets/private keys** \u2014 strong random HS256 secrets; never ship RS256 private keys to clients or git.\n- **Reject `alg: none`** \u2014 older libraries allowed unsigned tokens; configure the verifier to allow only HS256/RS256/ES256.\n- **Always verify the signature** before trusting claims.\n- **Validate `exp`, `aud`, `iss`** (and `nbf` if present). Prefer short-lived access tokens (e.g. 15 minutes).\n- **Revocation** \u2014 JWTs are hard to revoke once issued. Use short TTL + **refresh tokens** (revocable server-side), optional **blacklist** of `jti`, or versioned user tokens.\n- **Client storage** \u2014 localStorage is XSS-prone; **HttpOnly Secure** cookies need CSRF care; best practice for SPAs: access token in memory, refresh in HttpOnly cookie."}]},{id:"java-setup",title:"Java / Spring Security setup",blocks:[{type:"markdown",value:"Issue and verify with **Nimbus JOSE** (Spring Security OAuth2 Resource Server) or **jjwt**. At the edge, Spring Cloud Gateway can validate before routing\u2014see [API Gateway](/designs/api-gateway#java-spring-cloud-gateway)."},{type:"code",language:"java",filename:"JwtService.java",showLineNumbers:!0,code:`@Service
public class JwtService {
  private final SecretKey key =
      Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretBase64));

  public String issue(Long userId, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("role", role)
        .issuer("https://api.example.com")
        .audience().add("example-api").and()
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(15, ChronoUnit.MINUTES)))
        .id(UUID.randomUUID().toString())
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .requireIssuer("https://api.example.com")
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}`},{type:"code",language:"java",filename:"SecurityConfig.java",showLineNumbers:!0,code:`@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login", "/refresh").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
    return http.build();
  }

  @Bean
  JwtDecoder jwtDecoder(@Value("\${jwt.secret}") String secret) {
    SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    return NimbusJwtDecoder.withSecretKey(key).build();
  }
}`},{type:"callout",variant:"tip",title:"HS256 vs RS256 in microservices",body:"**HS256** is simple when one auth service and APIs share a secret. **RS256** fits distributed systems: the auth service signs with a private key; gateways and services verify with a published JWKS public key\u2014no shared secret sprawl."}]},{id:"summary",title:"Summary",blocks:[{type:"markdown",value:"JWTs package identity claims in a signed, URL-safe string so APIs can authenticate without shared session stores. Master the three-part structure, always verify signatures and standard claims, keep access tokens short-lived, and store them carefully. In Java, prefer Spring Security resource-server JWT support (or carefully configured jjwt) and validate at the [API Gateway](/designs/api-gateway) when possible."},{type:"callout",variant:"note",title:"Source",body:"Summarized and expanded from Ashish Pratap Singh\u2019s AlgoMaster article \u201CWhat are JSON Web Tokens (JWTs)?\u201D with Java/Spring Security setup notes for this platform."}]}]},a=t;export{a as default};
