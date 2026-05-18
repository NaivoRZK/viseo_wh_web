# opencode.spec - Auth Module Specification

## Project Context
- Frontend: Next.js (standalone)
- Backend: Flask (separate service)
- Database: Odoo (direct XML-RPC/JSON-RPC connection)
- Application: Warehouse management system authentication

## Authentication Flows
### Desktop (Large Screens)
1. Input: Strict email + password (non-empty)
2. Validation: Frontend uses React Hook Form + Zod (`z.string().email()` for email, non-empty password check)
3. Request: `POST http://127.0.0.1:5000/login` with `{ "login": "<email>", "password": "<password>" }`
4. Response: Flask session cookie + access token + refresh token
5. Post-login: Optional 4-digit PIN generation for mobile access

### Mobile (Small Screens)
1. Input: 4-digit PIN
2. Request: `POST http://127.0.0.1:5000/login-pin` with `{ "pin": "1234" }`
3. Response: Session cookie + tokens (validates PIN against Odoo-stored user PIN)

## API Endpoints (Flask Backend)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/login` | Email/password authentication | `{ "login": "email", "password": "pass" }` |
| POST | `/login-pin` | PIN-based mobile authentication | `{ "pin": "1234" }` |
| POST | `/logout` | Invalidate session & revoke tokens | - |
| POST | `/refresh` | Refresh expired access token | Refresh token (cookie/body) |

## Technical Constraints
- **Styling**: Tailwind CSS
- **Patterns**: SRP (Single Responsibility Principle), DRY, Smart/Dumb components
- **Forms**: React Hook Form + Zod (Next.js)
- **Backend**: Flask sessions + JWT access/refresh tokens, Odoo XML-RPC integration
- **UI/UX**: WCAG 2.1 accessibility, keyboard navigation, ARIA labels, performance-optimized
- **Testing**: Unit tests (Jest/React Testing Library for frontend, Pytest for backend)

## Validation Rules
- Email: Strict RFC-compliant format (Zod `z.string().email()`)
- Password: Non-empty string
- PIN: 4-digit numeric string

## Testing Strategy
- Frontend: Unit tests for form validation, auth hooks, component rendering
- Backend: Unit tests for Odoo integration, endpoint logic, token management
- E2E: Full auth flow tests (Playwright)
