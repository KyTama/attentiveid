# Content Transitions Method Signatures and Atomic CMS Publishing

## Symptoms
- Calling `POST /api/admin/landing/publish` crashes with:
  `TypeError: dependencies.contentTransitions.publishLandingRevision is not a function. (In 'dependencies.contentTransitions.publishLandingRevision(adminCap, new Date().toISOString())', 'dependencies.contentTransitions.publishLandingRevision' is undefined)`
- Publishing fails if no active draft exists (`activeDraftRevisionId: null`), forcing users into an awkward multi-step "save draft before publish" sequence.

## Root Cause
- Method name mismatch between HTTP route handlers and service layer interfaces:
  `landing-cms.ts` invoked `publishLandingRevision` while `content-transitions.ts` only exported `publishLandingDraft(capability, revisionId)`.
- Route unit tests previously mocked dependencies with empty objects, hiding the missing method during testing.

## Rule
1. **Service Aliasing & Fallbacks**: Expose both `publishLandingDraft` and `publishLandingRevision`. When `revisionId` is omitted, resolve `aggregate.activeDraftRevisionId` automatically.
2. **Atomic One-Step Publishing**: Allow `POST /api/admin/landing/publish` to accept an optional content mutation body. If provided, create the draft and immediately publish it in one atomic flow so on-screen edits in the CMS always go live immediately.
3. **Rigorous Route Unit Test Dependencies**: In route unit tests, inject mock objects with actual method signatures rather than bare empty stubs to verify transition execution before deployment.
