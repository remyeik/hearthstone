import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Box, CircularProgress } from '@mui/material';

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

export const HearthstoneCardView: React.FC = () => {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cards = await response.json();
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      console.log('Fetched card:', randomCard); // Debug log
      setCard(randomCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch card');
      console.error('Error fetching card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomCard();
  }, []);

  const getCardImageUrl = (cardId: string) => {
    // Art image URL
    return `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${cardId}.png`;
  };

  const getCardTileUrl = (cardId: string) => {
    // Regular card image URL
    return `https://art.hearthstonejson.com/v1/tiles/${cardId}.png`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Button
          variant="contained"
          onClick={fetchRandomCard}
          disabled={loading}
      >
        Draw Random Card
      </Button>
      {loading && <CircularProgress />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {card && (
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center'}}>
            <Box sx={{ maxWidth: 300, placeContent: 'start' }}>
              <img
                  src={getCardImageUrl(card.id)}
                  alt={`${card.name} art`}
                  style={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.error('Art image failed to load:', e);
                    setError('Failed to load card art image');
                  }}
              />
            </Box>
            <Box sx={{ maxWidth: 400, padding: 2, color: 'black',  bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <h2 style={{ margin: '0 0 16px 0' }}>{card.name}</h2>
              <div style={{ display: 'grid', gap: '8px' }}>
                {/*{card.cost !== undefined && (*/}
                {/*  <div>*/}
                {/*    <strong>Mana Cost:</strong> {card.cost}*/}
                {/*  </div>*/}
                {/*)}*/}
                {/*{card.attack !== undefined && (*/}
                {/*  <div>*/}
                {/*    <strong>Attack:</strong> {card.attack}*/}
                {/*  </div>*/}
                {/*)}*/}
                {/*{card.health !== undefined && (*/}
                {/*  <div>*/}
                {/*    <strong>Health:</strong> {card.health}*/}
                {/*  </div>*/}
                {/*)}*/}
                {card.type && (
                  <div>
                    <strong>Type:</strong> {card.type}
                  </div>
                )}
                {card.rarity && (
                  <div>
                    <strong>Rarity:</strong> {card.rarity}
                  </div>
                )}
                {card.set && (
                  <div>
                    <strong>Set:</strong> {card.set}
                  </div>
                )}
                {card.cardClass && (
                  <div>
                    <strong>Class:</strong> {card.cardClass}
                  </div>
                )}
                {card.text && (
                  <div>
                    <strong>Card Text:</strong>
                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                      {card.text.replace(/\$/g, '')}
                    </div>
                  </div>
                )}
                {card.flavor && (
                  <div>
                    <strong>Flavor Text:</strong>
                    <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      {card.flavor}
                    </div>
                  </div>
                )}
              </div>
            </Box>
          </Box>
      )}
    </Box>
  );
};
