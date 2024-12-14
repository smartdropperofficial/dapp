import { SessionExt } from '@/types/SessionExt';
import { getUserConfig } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
type ConfigType = {
    id: number;
    name: string;
    config_id: boolean;
    created_at: string;
    is_on: boolean;
    order_owner: string;
    subscription_owner: string;
    order_contract: string;
    coin_contract: string;
    promoter_contract: string;
    subscription_contract: string;
    subscription_management_contract: string;
    amazon_api: string;
    orderAbi: string;
    promoterAbi: string;
    subscriptionPlanAbi: string;
    subscriptionManagementAbi: string;
    pre_order_wallet: string;
    tax_wallet: string;
};
type AbiConfig = {
    orderAbi: string;
    promoterAbi: string;
    subscriptionPlanAbi: string;
    subscriptionManagementAbi: string;
};
interface ConfigContextProps {
    isLoading: boolean;
    config: ConfigType | null;
    abiConfig: Partial<AbiConfig> | null;
    setConfigHandler: (config: ConfigType | null) => void;
    setAbiConfigHandler: (abiConfig: Partial<AbiConfig> | null) => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ConfigContext = createContext<ConfigContextProps>({
    isLoading: false,
    config: null as ConfigType | null,
    abiConfig: null as Partial<AbiConfig> | null,
    setConfigHandler: (config: ConfigType | null) => {},
    setAbiConfigHandler: (abiConfig: Partial<AbiConfig> | null) => {},
    setIsLoading: () => {},
});

const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    // const [isLoading, setIsLoading] = useState<boolean>(false);

    const [config, setConfig] = useState<ConfigType | null>({
        id: 0,
        name: '',
        config_id: false,
        created_at: '',
        is_on: false,
        order_owner: '',
        subscription_owner: '',
        coin_contract: '',
        order_contract: '',
        promoter_contract: '',
        subscription_contract: '',
        subscription_management_contract: '',
        amazon_api: '',
        orderAbi: '',
        promoterAbi: '',
        subscriptionPlanAbi: '',
        subscriptionManagementAbi: '',
        pre_order_wallet: '',
        tax_wallet: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configAbi, setConfigAbi] = useState<Partial<AbiConfig> | null>({
        orderAbi: '',
        promoterAbi: '',
        subscriptionPlanAbi: '',
        subscriptionManagementAbi: '',
    });

    const setAbiConfigHandler = (partialAbiConfig: Partial<AbiConfig> | null) => {
        setConfigAbi(prevAbiConfig => ({
            ...prevAbiConfig,
            ...partialAbiConfig, // Sovrascrive solo i campi specificati
        }));
    };

    const setConfigHandler = (config: ConfigType | null) => {
        setConfig(config);
    };

    const store = {
        config: config,
        isLoading,
        abiConfig: configAbi,
        setConfigHandler,
        setAbiConfigHandler,
        setIsLoading,
    };

    useEffect(() => {
        const fetchConfig = async () => {
            let storedConfig;

            if (!storedConfig || storedConfig === 'null' || storedConfig === 'undefined' || storedConfig === '') {
                const userConfig = await getUserConfig(session?.config_db);
                if (userConfig) {
                    // console.log('🚀 ~ fetchConfig ~ userConfig:', userConfig);
                    setConfig(userConfig as ConfigType);
                    return;
                }
            } else {
                const parsedConfig = JSON.parse(storedConfig);
                setConfig(parsedConfig);
            }

            if (storedConfig) {
            }
        };

        if (session) {
            fetchConfig();
        }
    }, [session, session?.config_db]);

    useEffect(() => {
        if (config) {
        }
    }, [config]);

    return <ConfigContext.Provider value={store}>{children}</ConfigContext.Provider>;
};

export default ConfigContextProvider;
