import { Container, Heading, Text } from "@medusajs/ui";

// Shown in place of a custom admin page when the current user's role lacks the
// required permission. UX only — the server middleware is the real gate.
export const AccessDenied = ({ title, perm }: { title: string; perm: string }) => (
  <Container className="p-6">
    <Heading level="h1">{title}</Heading>
    <Text className="text-ui-fg-subtle mt-2">
      Энэ хэсгийг үзэх эрх танд байхгүй байна ({perm} шаардлагатай). Хэрэв танд хэрэгтэй бол админтай холбогдоно уу.
    </Text>
  </Container>
);
