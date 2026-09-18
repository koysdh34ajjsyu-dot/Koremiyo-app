# CLAUDE.md - AI Coding Assistant Rules for Koremiyo-app

## Site Specs & System Architecture
Please read `AI_SHARED_CONTEXT.md` (Machine Protocol) and `PROJECT_SPEC.md` at the project root for full project details.

### Key Rules:
1. **Language**: Always respond in Japanese (回答は日本語で作成してください).
2. **AI Shared Spec Sync**: Always read `AI_SHARED_CONTEXT.md` first. When adding features or modifying schemas/APIs, you MUST update `AI_SHARED_CONTEXT.md`.
3. **Design**: Eye-friendly soft slate background (`#edf2f7`), dark text (`#0f172a`), emerald green accent (`#059669`).
4. **Admin Security**: Admin button is hidden by default. Only reveal when secret key `?admin_key=koremiyo2026` is present.
5. **Validation**: Always run `npm run build` to test builds before declaring completion.
