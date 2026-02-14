# API Security

This document describes the security measures used by the Calamus API and how to apply them in new or existing endpoints.

## Implemented Measures

### 1. **Central security layer** (`api/security.php`)
- **CORS**: Allowed origins are configured in `api/config.php` (or `config.local.php`). In development the default is `*`; in production it is restricted to your frontend domain(s).
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.
- **Rate limiting**: File-based rate limiting for auth endpoints (login, register) to reduce brute force and abuse.
- **JSON helpers**: `apiJsonResponse()`, `apiJsonError()`, `apiHandlePreflight()` for consistent responses.

### 2. **Authentication**
- **Bearer token**: Sent in `Authorization: Bearer <token>`.
- **Token format**: Validated in `auth_helper.php` (length and format) before DB lookup.
- **Token lookup**: Use `getAuthenticatedUser($DB)` in `auth_helper.php` so token is validated with a **prepared statement** (no raw SQL with token).

### 3. **Database**
- **Prepared statements**: The `Database` class has `prepareRead($sql, $types, $params)` and `prepareSave($sql, $types, $params)`.
- Use these for any query that includes user input (identifiers, search terms, etc.) to prevent SQL injection.

### 4. **Auth endpoints**
- Login and register use the security layer, rate limiting, and prepared statements.
- Passwords are hashed with `password_hash(..., PASSWORD_BCRYPT)` and verified with `password_verify()`.

## Using the security layer in an endpoint

1. **Include and run security (after detecting environment):**
   ```php
   require_once __DIR__ . '/../config.php';
   require_once __DIR__ . '/../security.php';
   apiSecurityHeaders(['methods' => 'GET, POST, OPTIONS']);
   apiHandlePreflight();
   ```

2. **Require auth:**
   ```php
   require_once __DIR__ . '/../auth_helper.php';
   $DB = new Database();
   $user = getAuthenticatedUser($DB);
   if (!$user) {
       apiJsonError('Not authenticated', 401);
   }
   ```

3. **Rate limit (for sensitive actions):**
   ```php
   $ip = apiClientIp();
   if (!apiRateLimit('action_name:' . $ip, 10, 300)) {
       apiJsonError('Too many requests', 429);
   }
   ```

4. **Database: use prepared statements for user input:**
   ```php
   $rows = $DB->prepareRead('SELECT * FROM learners WHERE id = ?', 'i', [$userId]);
   $DB->prepareSave('UPDATE learners SET name = ? WHERE id = ?', 'si', [$name, $userId]);
   ```

## Configuration

- **Allowed origins**: In `config.local.php`, set `ALLOWED_ORIGINS` to an array of your frontend URLs in production.
- **Rate limiting**: `RATE_LIMIT_ENABLED` and `RATE_LIMIT_DIR` in `config.php` (overridable in `config.local.php`).

## Checklist for new/updated endpoints

- [ ] Include `security.php` and call `apiSecurityHeaders()` and `apiHandlePreflight()`.
- [ ] Use `getAuthenticatedUser($DB)` instead of manual token + raw SQL when auth is required.
- [ ] Use `prepareRead` / `prepareSave` for any query that includes user-controlled input.
- [ ] Validate and limit input (length, type) before using it.
- [ ] Return errors via `apiJsonError()` with appropriate HTTP status codes.
