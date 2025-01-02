import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Grid } from '@mui/material';

interface Card {
    id: string;
    name: string;
    cost?: number;
    attack?: number;
    health?: number;
    text?: string;
    flavor?: string;
    rarity?: string;
    type?: string;
    set?: string;
    cardClass?: string;
}

const HearthstoneGrid = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCards(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch cards');
                console.error('Error fetching cards:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    const getCardImageUrl = (cardId: string) => {
        return `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${cardId}.png`;
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box color="error.main" textAlign="center" p={4}>
            {error}
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1, p: 4 }}>
            <Grid container spacing={2}>
                {cards.map(card => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={card.id}>
                        <Box sx={{
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            p: 1,
                            '&:hover': {
                                boxShadow: 3,
                                transition: 'box-shadow 0.3s ease-in-out'
                            }
                        }}>
                            <img
                                src={getCardImageUrl(card.id)}
                                alt={card.name}
                                style={{ width: '100%', height: 'auto' }}
                                loading="lazy"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default HearthstoneGrid;