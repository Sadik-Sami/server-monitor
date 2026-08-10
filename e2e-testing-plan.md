# E2E Testing Plan for NestJS App

This document outlines the expansion of e2e testing coverage for the `/users` and `/remote-servers` endpoints.

## 🎯 Goals
1. Increase confidence in the API layer by testing HTTP endpoints, routing, validation, and authentication.
2. Test controller logic end-to-end against a real (test) database setup (`better-sqlite3` with `synchronize: true`).
3. Ensure unauthenticated access is rejected and bad requests are validated (`400 Bad Request`).
4. Standardize the e2e test setup across the test suite.

## 📝 Information Gathered from NestJS Documentation (Context7)
Based on official NestJS documentation regarding e2e tests:

- **Global Pipes in E2E:** To ensure DTO validation works in e2e tests (since the test spins up a fresh app instance), `ValidationPipe` must be explicitly applied to the test application instance.
  ```typescript
  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  ```
- **Overriding Global Guards:** You currently have a global `AuthGuard` registered via the `APP_GUARD` token in `AuthModule`. To override a globally registered enhancer (like a guard) in tests, NestJS documentation states you must change its registration from `useClass` to `useExisting`. This makes it a regular provider that can be targeted by `.overrideProvider()`.
  ```typescript
  providers: [
    AuthGuard, // Register as a regular provider
    {
      provide: 'APP_GUARD',
      useExisting: AuthGuard, // Change from useClass to useExisting
    },
  ]
  ```
  Then in the test module setup:
  ```typescript
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AuthGuard) // Now you can override the global guard!
    .useValue(mockAuthGuard)
    .compile();
  ```

## ✅ TODOs

### 1. Refactor Global AuthGuard Registration
- [ ] Update `apps/nest-app/src/auth/auth.module.ts`:
  - Change `useClass: AuthGuard` to `useExisting: AuthGuard` for the `APP_GUARD` token.
  - Add `AuthGuard` to the `providers` array.
- *Why:* This allows us to properly override the global authentication guard in our e2e tests to simulate both authenticated and unauthenticated states.

### 2. Standardize E2E Test Setup
- [ ] Update `apps/nest-app/test/app.e2e-spec.ts`:
  - Import `ValidationPipe` from `@nestjs/common`.
  - Add `app.useGlobalPipes(new ValidationPipe())` before `await app.init()`.

### 3. Create `users.e2e-spec.ts`
- [ ] Create file `apps/nest-app/test/users.e2e-spec.ts`.
- [ ] Setup `beforeEach` to boot the app with `ValidationPipe`.
- [ ] **Tests to implement:**
  - `POST /users`:
    - With valid payload -> Expect `201 Created`.
    - With invalid email (`{ email: "not-an-email" }`) -> Expect `400 Bad Request` (Validation error).
  - `GET /users`:
    - Expect `200 OK` and check array response.
  - `GET /users/:id`:
    - With existing ID -> Expect `200 OK`.
    - With non-existent ID -> Expect `404 Not Found`.
  - `PATCH /users/:id`:
    - Valid update -> Expect `200 OK`.
  - `DELETE /users/:id`:
    - Existing ID -> Expect `200 OK`.

### 4. Create `remote-servers.e2e-spec.ts`
- [ ] Create file `apps/nest-app/test/remote-servers.e2e-spec.ts`.
- [ ] Setup `beforeEach` to boot the app with `ValidationPipe`.
- [ ] **Tests to implement:**
  - `POST /remote-servers`:
    - With valid payload (`name`, `config` object) -> Expect `201 Created`.
    - Missing required fields (e.g., no `config`) -> Expect `400 Bad Request`.
  - `GET /remote-servers`:
    - Expect `200 OK` and check array response.
  - `GET /remote-servers/:id`:
    - Valid ID -> Expect `200 OK`.
    - Non-existent ID -> Expect `404 Not Found`.
  - `PATCH /remote-servers/:id`:
    - Valid update -> Expect `200 OK`.
  - `DELETE /remote-servers/:id`:
    - Existing ID -> Expect `200 OK`.
- [ ] **Authentication Tests:**
  - Create a describe block that uses `.overrideProvider(AuthGuard).useValue({ canActivate: () => false })` during `createTestingModule`.
  - Send a request to an endpoint (e.g., `GET /remote-servers`) -> Expect `403 Forbidden` (or `401`).