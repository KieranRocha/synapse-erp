import { Building2, Settings, UsersRound } from 'lucide-react'


export default function StepBoasVindas() {


    const CARDS = [{
        title: "Empresa",
        description: "Configure os dados da sua empresa",
        icon: <Building2 width={48} height={48} className='stroke-1 text-fg' />
    },
    {
        title: "Equipe",
        description: "Convide sua equipe para colaborar",
        icon: <UsersRound width={48} height={48} className='stroke-1 text-fg' />
    },
    {
        title: "Configurações",
        description: "Ajuste as preferências iniciais",
        icon: <Settings width={48} height={48} className='stroke-1 text-fg' />
    },

    ]
    return (
        <div>
            <div className='flex-col   items-center justify-center space-y-2 pb-8'>
                <h1 className='font-bold text-center text-fg text-3xl '>
                    Bem-vindo ao Synapse
                </h1>
                <p className='text-text text-sm px-30 text-center mb-10'>
                    Vamos configurar sua conta em alguns passos simples. Este processo levará apenas alguns minutos e permitirá que você comece a usar o sistema imediatamente.
                </p>
                <div className='flex space-x-6 justify-between '>
                    {CARDS.map((card, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center gap-1 p-6 px-10 w-full rounded-lg  bg-card hover:bg-neutral-800"
                        >
                            <div className="text-primary  mb-2">
                                {card.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-fg">
                                {card.title}
                            </h3>
                            <p className="text-text text-xs">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
