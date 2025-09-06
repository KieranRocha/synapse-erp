import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import type { Meta } from "../../../../utils/types";
import { useClientSearch, useClickOutside, DatabaseClient, useToast } from "../../../../../../shared/hooks";
import { ClientSearchDropdown, ClientForm, ProjectForm } from "../components";
import { stepDadosSchema, type StepDadosFormData, metaToFormData, formDataToMeta } from "../../../../schemas/stepDadosSchema";

interface StepDadosProps {
    meta: Meta;
    setMeta: (v: Meta) => void;
}

// Helper functions
const formatCNPJ = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 14);
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatCEP = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const formatDateBR = (iso: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
};

export default function StepDados({ meta, setMeta }: StepDadosProps) {
    const navigate = useNavigate();
    const toast = useToast();

    // Form management
    const form = useForm<StepDadosFormData>({
        resolver: zodResolver(stepDadosSchema),
        defaultValues: metaToFormData(meta),
        mode: 'onChange'
    });

    const { setValue, watch, formState: { errors } } = form;

    // Client search hook
    const {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        showDropdown,
        setShowDropdown,
        selectedClient,
        selectClient,
    } = useClientSearch();

    // Refs for dropdown
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside hook
    useClickOutside([searchInputRef as React.RefObject<HTMLElement>, dropdownRef as React.RefObject<HTMLElement>], () => {
        setShowDropdown(false);
    });

    // Handle client selection
    const handleClientSelection = (client: DatabaseClient) => {
        selectClient(client);

        const endereco = [client.logradouro, client.numero].filter(Boolean).join(", ");

        // Update form values
        setValue('clienteId', client.id);
        setValue('cliente', client.nome_fantasia || client.razao_social);
        setValue('cnpj', formatCNPJ(client.cpf_cnpj));
        setValue('clienteEndereco', endereco);
        setValue('clienteBairro', client.bairro || "");
        setValue('clienteCidade', client.cidade || "");
        setValue('clienteUF', client.uf || "");
        setValue('clienteCEP', client.cep ? formatCEP(client.cep) : "");
        setValue('clienteAtividade', "");
        setValue('clienteAbertura', client.created_at ? formatDateBR(client.created_at) : "");

        toast.success(`Cliente "${client.nome_fantasia || client.razao_social}" selecionado!`);
    };

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);

        if (!value.trim()) {
            // Clear client data when search is cleared
            setValue('clienteId', undefined);
            setValue('cliente', "");
            setValue('cnpj', "");
            setValue('clienteEndereco', "");
            setValue('clienteBairro', "");
            setValue('clienteCidade', "");
            setValue('clienteUF', "");
            setValue('clienteCEP', "");
            setValue('clienteAtividade', "");
            setValue('clienteAbertura', "");
        }
    };

    // Handle project form changes
    const handleProjectChange = (field: keyof StepDadosFormData, value: string) => {
        setValue(field, value);
    };

    // Handle new client navigation
    const handleNewClient = () => {
        navigate('/clientes/novo');
    };

    // Handle dropdown focus
    const handleDropdownFocus = () => {
        if (searchResults.length > 0) {
            setShowDropdown(true);
        }
    };

    // Sync form data with meta
    React.useEffect(() => {
        const subscription = watch((data) => {
            setMeta({ ...meta, ...formDataToMeta(data as StepDadosFormData) });
        });
        return () => subscription.unsubscribe();
    }, [watch, meta, setMeta]);

    const formValues = watch();

    return (
        <section className="bg-bg border-border text-fg rounded-2xl border p-6">
            <h3 className="font-semibold mb-4 text-lg">Dados do Orçamento</h3>

            <form className="space-y-5">
                <ProjectForm
                    data={{
                        numero: formValues.numero || '',
                        nome: formValues.nome || '',
                        responsavel: formValues.responsavel || '',
                        dataInicio: formValues.dataInicio || '',
                        previsaoEntrega: formValues.previsaoEntrega || '',
                        descricao: formValues.descricao || '',
                    }}
                    onChange={handleProjectChange}
                />

                <ClientSearchDropdown
                    ref={dropdownRef}
                    searchTerm={searchTerm}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    showDropdown={showDropdown}
                    selectedClient={selectedClient}
                    onSearchChange={handleSearchChange}
                    onSelectClient={handleClientSelection}
                    onFocus={handleDropdownFocus}
                    onNewClient={handleNewClient}
                />

                <ClientForm
                    data={{
                        cliente: formValues.cliente || '',
                        clienteEndereco: formValues.clienteEndereco || '',
                        clienteBairro: formValues.clienteBairro || '',
                        clienteCidade: formValues.clienteCidade || '',
                        clienteUF: formValues.clienteUF || '',
                        clienteCEP: formValues.clienteCEP || '',
                        clienteAtividade: formValues.clienteAtividade || '',
                        clienteAbertura: formValues.clienteAbertura || '',
                    }}
                />

                {/* Error display */}
                {Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h4 className="text-sm font-medium text-red-800">Erros de validação:</h4>
                        <ul className="mt-2 text-sm text-red-700">
                            {Object.entries(errors).map(([field, error]) => (
                                <li key={field}>
                                    {error?.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
        </section>
    );
}