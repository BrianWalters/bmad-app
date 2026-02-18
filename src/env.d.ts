/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session?: {
      userId: number;
      username: string;
      csrfToken: string;
      sessionId: string;
    };
  }
}
