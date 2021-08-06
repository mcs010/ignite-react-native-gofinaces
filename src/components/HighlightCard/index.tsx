import React from 'react';

import { 
    Container,
    Header,
    Title,
    Icon,
    Footer,
    Amount,
    LastTransaction,
} from './styles';

interface Props{
    type: 'up' | 'down' | 'total';
    title: string;
    amount: string;
    lastTransaction: string;
}

const icon = {
    up: 'arrow-up-circle',
    down: 'arrow-down-circle',
    total: 'dollar-sign',
}

export function HighLightCard({ type, title, amount, lastTransaction } : Props){
    return (
        <Container type={type}>
        {/* Receives the property type with the type value */}    

            <Header>
                <Title type={type}>
                    {title}
                </Title>

                {/* The Icon receives a type propertie with a type value */}
                <Icon 
                    name={icon[type]} 
                    type={type} 
                />
                
            </Header>

            <Footer>
                <Amount type={type}>
                    {amount}
                </Amount>

                <LastTransaction type={type}>
                    {lastTransaction}
                </LastTransaction>
            </Footer>

        </Container>
    )
}