import React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

interface HearthstoneCard {
    name: string;
    cost: number;
    attack?: number;
    health?: number;
    armor?: number;
    text?: string;
    type: string;
    rarity?: string;
    cardClass?: string;
    set?: string;
    flavor?: string;
    artist?: string;
    mechanics?: string[];
    collectible: boolean;
}

function HearthstoneCardDrawer() {
    const [card, setCard] = React.useState<HearthstoneCard | null>(null);
    const [loading, setLoading] = React.useState(false);

    const drawCard = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.json');
            const cards = await response.json();
            const collectibleCards = cards.filter((card: HearthstoneCard) =>
                card.collectible === true && card.name
            );
            const randomCard = collectibleCards[Math.floor(Math.random() * collectibleCards.length)];
            setCard(randomCard);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get color based on rarity
    const getRarityColor = (rarity: string = '') => {
        const colors: { [key: string]: string } = {
            LEGENDARY: '#ff8c00',
            EPIC: '#a335ee',
            RARE: '#0070dd',
            COMMON: '#ffffff',
            FREE: '#grey'
        };
        return colors[rarity] || '#ffffff';
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Button
                onClick={drawCard}
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
            >
                {loading ? 'Drawing...' : 'Draw Random Card'}
            </Button>

            {card && (
                <Card sx={{ mt: 2 }}>
                    <CardHeader
                        title={card.name}
                        subheader={`${card.cardClass || 'Neutral'} - ${card.type}`}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '& .MuiCardHeader-subheader': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }}
                    />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip label={`Cost: ${card.cost}`} color="primary" />
                                    {card.attack !== undefined && (
                                        <Chip label={`Attack: ${card.attack}`} color="error" />
                                    )}
                                    {card.health !== undefined && (
                                        <Chip label={`Health: ${card.health}`} color="success" />
                                    )}
                                    {card.armor !== undefined && (
                                        <Chip label={`Armor: ${card.armor}`} color="info" />
                                    )}
                                </Box>
                            </Grid>

                            {card.text && (
                                <Grid item xs={12}>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        <strong>Card Text:</strong> {card.text}
                                    </Typography>
                                </Grid>
                            )}

                            {card.mechanics && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>Mechanics:</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {card.mechanics.map((mechanic, index) => (
                                            <Chip key={index} label={mechanic} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Set: {card.set}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Rarity: <span style={{ color: getRarityColor(card.rarity) }}>{card.rarity}</span>
                                </Typography>
                            </Grid>

                            {card.flavor && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 2, color: 'text.secondary' }}>
                                        "{card.flavor}"
                                    </Typography>
                                </Grid>
                            )}

                            {card.artist && (
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Artist: {card.artist}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default HearthstoneCardDrawer;