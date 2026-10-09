"use client";

import React from "react";
import AppHeader from "./layout/app-header";

interface HeaderProps {
  activeTab?: "dashboard" | "explorer" | "marketplace" | "retire" | "register";
}

export default function Header(_props: HeaderProps) {
  return <AppHeader />;
}
