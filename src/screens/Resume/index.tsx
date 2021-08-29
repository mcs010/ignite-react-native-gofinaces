import React, {useEffect, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Hooks
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components';

import { HistoryCard } from '../../components/HistoryCard';
import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer,
} from './styles';
import { categories } from '../../utils/categories';


interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume(){
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])

    const theme = useTheme()

    function handleDateChange(action: 'next' | 'prev'){
        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1))
        }else{
            setSelectedDate(subMonths(selectedDate, 1))
        }
    }

    async function loadData() {
        setIsLoading(true)

        const dataKey = '@gofinances:transactions'
        const response = await AsyncStorage.getItem(dataKey)
        const responseFormatted = response ? JSON.parse(response) : []

        // Filters all expenses according to each month and year
        const expenses = responseFormatted.filter((expense: TransactionData) => 
            expense.type === 'negative' &&
            new Date(expense.date).getMonth() === selectedDate.getMonth() &&
            new Date(expense.date).getFullYear() === selectedDate.getFullYear()
        )

        // Get the total of expenses to discover each category porcentage
        const expensesTotal = expenses.reduce((accumullator: number, expense: TransactionData) =>{
            return accumullator + Number(expense.amount)
        }, 0)

        // Array that stores the balance of each category
        const totalByCategory: CategoryData[] = []

        // Iterates each category
        categories.forEach(category => {
            let categorySum = 0

            // Sums the expenses of the category
            expenses.forEach((expense: TransactionData) => {
                if(expense.category === category.key){
                    categorySum += Number(expense.amount)
                }
            })

            // Formats the balance to local currency
            if(categorySum > 0){
                const totalFormatted = categorySum.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })

                // Formatted percentage of the category
                const percent = `${(categorySum / expensesTotal *100).toFixed(0)}%`

                // Inserts in the array the object info of the category
                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent,
                })
            }

        })

        setTotalByCategories(totalByCategory)
        setIsLoading(false)
    }

    // Returns the result of an async function when it's already loaded
    useFocusEffect(
        useCallback(() => {
        loadData()
    },[selectedDate])) // Triggered every time the dependency array is changed

    return(
        <Container>
                
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>

            {
                isLoading ? 
                    <LoadContainer> 
                        <ActivityIndicator color={theme.colors.primary} size="large" /> 
                    </LoadContainer> :

                    <Content 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingBottom: useBottomTabBarHeight(),
                        }}
                    >

                        <MonthSelect>
                            <MonthSelectButton onPress={() => handleDateChange('prev')}>
                                <MonthSelectIcon name="chevron-left" />
                            </MonthSelectButton>

                            <Month>{format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}</Month>

                            <MonthSelectButton onPress={() => handleDateChange('next')}>
                                <MonthSelectIcon name="chevron-right" />
                            </MonthSelectButton>
                        </MonthSelect>

                        <ChartContainer>
                            <VictoryPie 
                                data={totalByCategories}
                                colorScale={totalByCategories.map(category => category.color)}
                                style={{
                                    labels: {
                                        fontSize: RFValue(18),
                                        fontWeight: 'bold',
                                        fill: theme.colors.shape,
                                    }
                                }}
                                labelRadius={50}
                                x="percent"
                                y="total"
                            />
                        </ChartContainer>

                        {
                            totalByCategories.map(item =>(
                                <HistoryCard
                                    key={item.key} 
                                    title={item.name}
                                    amount={item.totalFormatted}
                                    color={item.color}
                                />
                            ))
                        }
                    </Content>

            }
        </Container>
    )
}