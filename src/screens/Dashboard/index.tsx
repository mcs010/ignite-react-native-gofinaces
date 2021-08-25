import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';

import { HighLightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Components
import { 
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    Username,
    Icon,
    HighLightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton
} from './styles';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export interface DataListProps extends TransactionCardProps{
    id: string;
}

export function Dashboard(){
    const [data, setData] = useState<DataListProps[]>([])

    async function loadTransactions() {
        const dataKey = '@gofinances:transactions'
        const response = await AsyncStorage.getItem(dataKey)

        const transactions = response ? JSON.parse(response) : []

        const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
            //console.log(item.date)
            const amount = Number(item.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })

            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date))

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date
            }
        })

        setData(transactionsFormatted)
    }

    useEffect(() => {
        loadTransactions()
    }, [])
    
    // useFocusEffect(
    //     useCallback(() => {
    //     loadTransactions()
    // },[]),
    // )

    return(
        <Container>

            {/* Header - Contains user profile pic, greeting, user name and logout button */}
            <Header>

                <UserWrapper>
                    <UserInfo>
                        <Photo 
                            source={{ uri: 'https://avatars.githubusercontent.com/u/70182991?v=4'}} 
                        />
                        <User>
                            <UserGreeting>Olá,</UserGreeting>
                            <Username>Matheus</Username>
                        </User>
                    </UserInfo>

                    <LogoutButton onPress={() => {}}>
                        <Icon name="power" />
                    </LogoutButton>

                </UserWrapper>

            </Header>
            {/* End Header */}

            {/* Agroups All Summary Cards */}
            <HighLightCards>
                <HighLightCard type="up" title="Entradas" amount="R$ 17.400,00" lastTransaction="Última entrada dia 13 de abril" />
                <HighLightCard type="down" title="Saídas" amount="R$ 1.259,00" lastTransaction="Última saída dia 03 de abril" />
                <HighLightCard type="total" title="Total" amount="R$ 16.141,00" lastTransaction="01 à 16 de abril" />
            </HighLightCards>

            <Transactions>
                <Title>Listagem</Title>

                <TransactionList
                    data={data}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <TransactionCard data={item} />}
                />

            </Transactions>

        </Container>
    )
}