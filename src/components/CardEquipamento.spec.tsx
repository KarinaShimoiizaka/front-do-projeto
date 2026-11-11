import { render, screen } from "@testing-library/react";

import { CardEquipamento } from "./CardEquipamento";

describe("FE-04 card do catálogo", () => {
  it("FE-04 CA-1: mostra a foto do equipamento e nenhum texto de crédito", () => {
    render(
      <CardEquipamento
        equipamento={{
          id: "q1",
          nome: "Notebook 14 polegadas",
          categoria: "Notebook",
          patrimonio: "TI-0001",
          situacao: "disponivel",
          imagemUrl: "https://projeto.supabase.co/storage/v1/object/public/b/equipamentos/TI-0001.jpg",
        }}
        detalhe="Pronto para retirada no balcão"
        acao={{ rotulo: "Solicitar empréstimo", habilitado: true, variante: "primary" }}
        aoSolicitar={() => undefined}
      />,
    );

    const foto = screen.getByRole("img", { name: "Notebook 14 polegadas" });
    expect(foto).toHaveAttribute(
      "src",
      "https://projeto.supabase.co/storage/v1/object/public/b/equipamentos/TI-0001.jpg",
    );
    expect(screen.queryByText(/crédito|fotos:|pixabay|foto de/i)).not.toBeInTheDocument();
  });
});
