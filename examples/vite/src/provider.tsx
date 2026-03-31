import { ContainerProvider } from "@abdokouta/react-di";

import { AppModule } from "@/modules/app.module";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ContainerProvider module={AppModule}>
      {children}
    </ContainerProvider>
  );
}
