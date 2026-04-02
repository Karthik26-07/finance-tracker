# Global Exception Handling - Quick Reference

## One-Liner: How to Write New Server Actions

```typescript
export async function myAction(data: any) {
  return executeServerAction(
    async () => {
      // Write your code here - ALL errors caught automatically ✅
      throw new ValidationError("Example"); // Caught & logged
      return { success: true };
    },
    { action: "myAction", userId: optionalUserId },
  );
}
```

## That's It!

**No try-catch blocks needed anywhere.**

---

## Error Types Available

```typescript
// Use these - they're automatically handled

throw new ValidationError("Email is required");
// → Returns: { error: "Email is required", code: "VALIDATION_ERROR" }

throw new AuthError("UNAUTHORIZED", "Please log in");
// → Returns: { error: "Please log in", code: "UNAUTHORIZED" }

throw new RateLimitError();
// → Returns: { error: "Too many requests...", code: "RATE_LIMIT" }

throw new AccountLockedError();
// → Returns: { error: "Account is temporarily locked...", code: "ACCOUNT_LOCKED" }

throw new Error("Any error");
// → Returns: { error: "An unexpected error occurred...", code: "INTERNAL_SERVER_ERROR" }
```

---

## What Gets Logged Automatically

Every error ✅ is logged with:

- Timestamp
- Action name
- User ID (if provided)
- IP address
- User Agent
- Full error stack trace (server-side only)
- Error type / code

---

## Response Patterns

### Return Success

```typescript
return { success: true };
```

### Return Error (custom handling)

```typescript
return { error: "Custom message", code: "CUSTOM_CODE" };
```

### Throw Error (recommended for automatic handling)

```typescript
throw new AuthError("CODE", "Message");
// Caught → Logged → Returned to client automatically
```

---

## Summary

| Pattern                    | Result                                           |
| -------------------------- | ------------------------------------------------ |
| Throw error inside handler | ✅ Caught globally, logged, client response sent |
| Return { error: '...' }    | ✅ Passed through, auto-logged                   |
| Return { success: true }   | ✅ Success response                              |
| No return                  | ✅ Empty success response                        |

**Zero try-catch blocks needed anywhere in your code.**
