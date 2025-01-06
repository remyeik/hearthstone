import React, { useState } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';

const CardView = ({ card }) => {
    const [showDetails, setShowDetails] = useState(false);

    const cardDetails = (
        <Box p={2}>
            <Typography variant="h6">{card.name}</Typography>
            <Typography>
                {card.cardClass} {card.type} - {card.rarity}
            </Typography>
            {card.cost !== undefined && (
                <Typography>Cost: {card.cost}</Typography>
            )}
            {card.attack !== undefined && card.health !== undefined && (
                <Typography>
                    Attack: {card.attack} / Health: {card.health}
                </Typography>
            )}
            {card.text && (
                <Typography>
                    {card.text.replace(/\[x\]/g, '')}
                </Typography>
            )}
            {card.flavor && (
                <Typography color="text.secondary" fontStyle="italic">
                    {card.flavor}
                </Typography>
            )}
        </Box>
    );

    return (
        <Tooltip 
            title={cardDetails}
            open={showDetails}
            onOpen={() => setShowDetails(true)}
            onClose={() => setShowDetails(false)}
            arrow
            placement="right"
            PopperProps={{
                sx: {
                    '& .MuiTooltip-tooltip': {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        maxWidth: 320,
                        border: 1,
                        borderColor: 'divider'
                    }
                }
            }}
        >
            <Box
                onMouseEnter={() => setShowDetails(true)}
                onMouseLeave={() => setShowDetails(false)}
                sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s'
                    }
                }}
            >
                <Box
                    component="img"
                    src={`https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${card.id}.png`}
                    alt={card.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.textContent = `${card.name} (Image not available)`;
                            parent.style.backgroundColor = '#f0f0f0';
                            parent.style.display = 'flex';
                            parent.style.alignItems = 'center';
                            parent.style.justifyContent = 'center';
                            parent.style.padding = '1rem';
                            parent.style.textAlign = 'center';
                        }
                    }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
            </Box>
        </Tooltip>
    );
};

export default CardView;