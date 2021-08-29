import React, { useCallback, useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from 'styled-components';
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
    LogoutButton,
    LoadContainer
} from './styles';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export interface DataListProps extends TransactionCardProps{
    id: string;
}

interface HiglightProps {
    amount: string;
    lastTransaction: string;
}

interface HighlightData {
    entries: HiglightProps;
    expenses: HiglightProps;
    total: HiglightProps;
}

export function Dashboard(){
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState<DataListProps[]>([])
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData)

    const theme = useTheme()

    // Gets last date of each type of transaction
    function getLastTransactionDate(
        collection: DataListProps[], 
        type: 'positive' | 'negative'){
            const lastTransaction = 
            new Date(
                Math.max.apply(Math, collection
                    .filter(transaction => transaction.type === type)
                    .map(transaction => new Date(transaction.date).getTime()))
            )

            return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', {month: 'long'})}`
    }

    // Loads all transaction objects
    async function loadTransactions() {
        const dataKey = '@gofinances:transactions'
        const response = await AsyncStorage.getItem(dataKey)
        const transactions = response ? JSON.parse(response) : []

        // Higlight Cards variables
        let entriesTotal = 0
        let expensesTotal = 0

        const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
            // Sum of the positive balance
            if(item.type === 'positive'){
                entriesTotal += Number(item.amount)
            }else{
                expensesTotal += Number(item.amount)
            }


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

        setTransactions(transactionsFormatted)

        const lastTransactionEntries = getLastTransactionDate(transactions, 'positive')
        const lastTransactionExpenses = getLastTransactionDate(transactions, 'negative')
        const totalInterval = `01 a ${lastTransactionExpenses}`


        const total = entriesTotal - expensesTotal

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionEntries}`,
            },
            expenses: {
                amount: expensesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última saída dia ${lastTransactionEntries}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval
            },
        })

        setIsLoading(false)
    }

    useEffect(() => {
        loadTransactions()
    }, [])
    
    useFocusEffect(
        useCallback(() => {
        loadTransactions()
    },[]),
    )

    return(
        <Container>

            {
                isLoading ? 
                <LoadContainer> 
                    <ActivityIndicator color={theme.colors.primary} size="large" /> 
                </LoadContainer> :
                <>

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
                        <HighLightCard 
                            type="up" 
                            title="Entradas" 
                            amount= {highlightData.entries.amount} 
                            lastTransaction= {highlightData.entries.lastTransaction}
                        />
                        <HighLightCard 
                            type="down" 
                            title= "Saídas" 
                            amount= {highlightData.expenses.amount} 
                            lastTransaction= {highlightData.expenses.lastTransaction} 
                        />
                        <HighLightCard 
                            type="total" 
                            title="Total" 
                            amount= {highlightData.total.amount} 
                            lastTransaction= {highlightData.total.lastTransaction} 
                        />
                    </HighLightCards>

                    <Transactions>
                        <Title>Listagem</Title>

                        <TransactionList
                            data={transactions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <TransactionCard data={item} />}
                        />

                    </Transactions>
                </>
            }
        </Container>
    )
}