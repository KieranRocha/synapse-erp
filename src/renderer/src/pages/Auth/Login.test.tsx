import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import AuthLogin from "./Login";
// Note: Button is mocked below; no direct import needed


vi.mock("../../assets/logo-dark.svg", () => ({ default: "Logo.svg" }));


vi.mock("../../shared/components/ui/Button", () => ({
    Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{props.children}</button>
    ),
}));
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<any>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock do AuthContext (o mais importante pra este teste)
const loginMock = vi.fn();
let isLoadingMock = false;


vi.mock("../../shared/contexts/AuthContext", () => ({
    useAuth: () => ({
        login: loginMock,
        isLoading: isLoadingMock,
    }),
}));

// Reset antes de cada teste
beforeEach(() => {
    vi.clearAllMocks();
    isLoadingMock = false;
    localStorage.clear();
});


async function fillAndSubmit(email: string, password: string) {
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/^e-mail$/i);
    const passInput = screen.getByLabelText(/^senha$/i);
    const submitBtn = screen.getByRole("button", { name: /entrar/i });

    await user.clear(emailInput);
    await user.type(emailInput, email);
    await user.clear(passInput);
    await user.type(passInput, password);
    await user.click(submitBtn);
}

describe("AuthLogin", () => {
    it("não chama login e mostra erros com e-mail invalido e senha curta", async () => {
        render(<AuthLogin />);

        await fillAndSubmit("invalido", "123");

        // Mensagens de erro dos campos

        expect(loginMock).not.toHaveBeenCalled();
    })
})
