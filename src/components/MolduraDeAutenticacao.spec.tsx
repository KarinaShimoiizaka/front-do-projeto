import { render, screen } from "@testing-library/react";

import { MolduraDeAutenticacao } from "./MolduraDeAutenticacao";

describe("FE-04 copy do login (PRD §5.1 alterado)", () => {
  it("FE-04 CA-9: o login mostra 5 itens por pessoa e 14 dias úteis de prazo", () => {
    render(
      <MolduraDeAutenticacao>
        <p>formulário</p>
      </MolduraDeAutenticacao>,
    );

    expect(screen.getByText("itens por pessoa").previousSibling).toHaveTextContent("5");
    expect(screen.getByText("dias úteis de prazo").previousSibling).toHaveTextContent("14");
  });
});
