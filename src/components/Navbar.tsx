"use client";

import Link from "next/link";
import { LanguageSelector } from "./LanguageSelector";
import { UserDropdown } from "./UserDropdown";

export default function Navbar() {
  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            Graphand Admin
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
}
