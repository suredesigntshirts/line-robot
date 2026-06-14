// shadcn/ui owned primitives (canon TECH-07), exposed on the `@line-robot/ui/ui` subpath so they
// don't collide with the package's DOMAIN components (the main barrel's `Badge` is the register-
// driven status pill, NOT this presentational shadcn one). The website + the Stage-5 mini-app both
// consume these.
export { cn } from "../../lib/utils.ts";
export { Badge, badgeVariants } from "./badge.tsx";
export { Button, buttonVariants } from "./button.tsx";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card.tsx";
