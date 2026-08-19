# CLAUDE.md - AI Coding Assistant Rules for Koremiyo-app

## Site Specs & System Architecture
Please read `README.md` and `PROJECT_SPEC.md` at the project root for full project details.

### Key Rules:
1. **Language**: Always respond in Japanese (回答は日本語で作成してください).
2. **Design**: Eye-friendly soft slate background (`#edf2f7`), dark text (`#0f172a`), emerald green accent (`#059669`).
3. **Admin Security**: Admin button is hidden by default. Only reveal when secret key `?admin_key=koremiyo2026` is present.
4. **Validation**: Always run `npx next build` to test builds before declaring completion.
