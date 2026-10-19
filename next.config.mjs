/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Necessário para o alvo `runner` do DockerFile: gera .next/standalone com
  // um server.js e só as dependências que ele de fato usa.
  output: "standalone",
};

export default nextConfig;
