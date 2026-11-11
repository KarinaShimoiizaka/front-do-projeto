import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Necessário para o alvo `runner` do DockerFile: gera .next/standalone com
  // um server.js e só as dependências que ele de fato usa.
  output: "standalone",
  // A pasta de cima (emprestimo-tools-kit) tem package-lock.json próprio, e o
  // Next tomaria ela como raiz do workspace. A raiz do front é esta pasta.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
