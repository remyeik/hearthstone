import React, { useState, useEffect } from "react";
import {
    CircularProgress,
    Box,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Radio,
    RadioGroup,
    Button,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import hearthstoneLogo from "../assets/hearthstone-logo.png";

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
    image?: string;
}

interface SetInfo {
    order: number;
    date: string;
    isMiniSet: boolean;
    apiName?: string; // The name used in the API
}

const isSetInStandard = (
    setName: string,
    setInfo: { [key: string]: SetInfo },
): boolean => {
    // Core set is always in standard
    if (setName === "CORE") return true;

    const set = setInfo[setName];
    if (!set || !set.date) return false;

    // Calculate 2 years ago from current date
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Parse the set's release date
    const [month, day, year] = set.date.split(", ")[0].split(" ");
    const monthIndex = new Date(Date.parse(`${month} 1, 2000`)).getMonth();
    const setDate = new Date(parseInt(year), monthIndex, parseInt(day));

    // Check if the set was released within the last 2 years
    return setDate >= twoYearsAgo;
};

const HearthstoneGrid = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [filteredCards, setFilteredCards] = useState<Card[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSet, setSelectedSet] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [showActiveCards, setShowActiveCards] = useState(false);
    const [mousePosition, setMousePosition] = useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [selectedManaCost, setSelectedManaCost] = useState<string>("");
    const [hoveredCard, setHoveredCard] = useState<Card | null>(null); // Store the currently hovered card
    const [page, setPage] = useState(1);
    const cardsPerPage = 20;
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Map the selected set to its API name
    // const getApiSetName = (selectedSet: string): string => {
    //     switch (selectedSet) {
    //         case "GREAT_DARK_BEYOND":
    //             return "THE_GREAT_DARK_BEYOND";
    //         case "BOOMS_INVENTIONS":
    //             return "DR_BOOMS_INCREDIBLE_INVENTIONS";
    //         case "RETURN_OF_THE_LICH_KING":
    //             return "MARCH_OF_THE_LICH_KING";
    //         case "THE_BARRENS":
    //             return "FORGED_IN_THE_BARRENS";
    //         case "BLACK_TEMPLE":
    //             return "ASHES_OF_OUTLAND";
    //         case "DRAGONS":
    //             return "DESCENT_OF_DRAGONS";
    //         case "DALARAN":
    //             return "RISE_OF_SHADOWS";
    //         case "TROLL":
    //             return "RASTAKHANS_RUMBLE";
    //         case "GILNEAS":
    //             return "THE_WITCHWOOD";
    //         case "LOOTAPALOOZA":
    //             return "KOBOLDS_AND_CATACOMBS";
    //         case "ICCA":
    //             return "ICCA01";
    //         case "GANGS":
    //             return "MEAN_STREETS_OF_GADGETZAN";
    //         case "OG":
    //             return "WHISPERS_OF_THE_OLD_GODS";
    //         default:
    //             return selectedSet;
    //     }
    // };

    // Legg til sorteringsfunksjon
    const sortCards = (cards: Card[]) => {
        return [...cards].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return sortOrder === "asc" 
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                case "cost":
                    return sortOrder === "asc"
                        ? (a.cost ?? 0) - (b.cost ?? 0)
                        : (b.cost ?? 0) - (a.cost ?? 0);
                case "attack":
                    return sortOrder === "asc"
                        ? (a.attack ?? 0) - (b.attack ?? 0)
                        : (b.attack ?? 0) - (a.attack ?? 0);
                case "health":
                    return sortOrder === "asc"
                        ? (a.health ?? 0) - (b.health ?? 0)
                        : (b.health ?? 0) - (a.health ?? 0);
                default:
                    return 0;
            }
        });
    };

    useEffect(() => {
        const filtered = cards.filter((card) => {
            // Class filter
            if (selectedClass && card.cardClass !== selectedClass) {
                return false;
            }

            // Set filter
            if (selectedSet) {
                const apiName = setInfo[selectedSet]?.apiName;
                if (!apiName || card.set !== apiName) {
                    return false;
                }
            }

            // Mana cost filter
            if (selectedManaCost) {
                if (selectedManaCost === "7+") {
                    if ((card.cost ?? 0) < 7) return false;
                } else {
                    if (card.cost !== parseInt(selectedManaCost)) return false;
                }
            }

            // Rotation filter
            if (showActiveCards) {
                const setKey = Object.keys(setInfo).find(
                    (key) => setInfo[key].apiName === card.set,
                );
                if (!setKey || !isSetInStandard(setKey, setInfo)) {
                    return false;
                }
            }

            // Search filter
            if (searchTerm) {
                const query = searchTerm.toLowerCase();
                return (
                    card.name.toLowerCase().includes(query) ||
                    (card.text && card.text.toLowerCase().includes(query)) ||
                    (card.flavor &&
                        card.flavor.toLowerCase().includes(query)) ||
                    (card.rarity &&
                        card.rarity.toLowerCase().includes(query)) ||
                    (card.type && card.type.toLowerCase().includes(query))
                );
            }

            return true;
        });

        const sortedAndFiltered = sortCards(filtered);
        setFilteredCards(sortedAndFiltered);
        setPage(1);
        setHasMore(filtered.length > cardsPerPage);
    }, [
        searchTerm,
        selectedClass,
        selectedSet,
        cards,
        showActiveCards,
        selectedManaCost,
        sortBy,
        sortOrder,
    ]);

    // Expansion and mini-sets
    const setInfo: { [key: string]: SetInfo } = {
        HEROES_OF_STARCRAFT: {
            order: 43,
            date: "January 31, 2025",
            isMiniSet: true,
            apiName: "HEROES_OF_STARCRAFT",
        },
        THE_GREAT_DARK_BEYOND: {
            order: 42,
            date: "November 5, 2024",
            isMiniSet: false,
            apiName: "GREAT_DARK_BEYOND",
        },
        THE_TRAVELING_TRAVEL_AGENCY: {
            order: 41,
            date: "September 10, 2024",
            isMiniSet: true,
            apiName: "TRAVELING_TRAVEL_AGENCY",
        },
        PERILS_IN_PARADISE: {
            order: 40,
            date: "July 23, 2024",
            isMiniSet: false,
            apiName: "PERILS_IN_PARADISE",
        },
        DR_BOOMS_INCREDIBLE_INVENTIONS: {
            order: 39,
            date: "May 14, 2024",
            isMiniSet: true,
            apiName: "BOOMS_INVENTIONS",
        },
        WHIZBANGS_WORKSHOP: {
            order: 38,
            date: "March 19, 2024",
            isMiniSet: false,
            apiName: "WHIZBANGS_WORKSHOP",
        },
        DELVE_INTO_DEEPHOLM: {
            order: 37,
            date: "January 18, 2024",
            isMiniSet: true,
            apiName: "DELVE_INTO_DEEPHOLM",
        },
        SHOWDOWN_IN_THE_BADLANDS: {
            order: 36,
            date: "November 14, 2023",
            isMiniSet: false,
            apiName: "BADLANDS",
        },
        FALL_OF_ULDUAR: {
            order: 35,
            date: "September 19, 2023",
            isMiniSet: true,
            apiName: "FALL_OF_ULDUAR",
        },
        TITANS: {
            order: 34,
            date: "August 1, 2023",
            isMiniSet: false,
            apiName: "TITANS",
        },
        AUDIOPOCALYPSE: {
            order: 33,
            date: "May 31, 2023",
            isMiniSet: true,
            apiName: "AUDIOPOCALYPSE",
        },
        FESTIVAL_OF_LEGENDS: {
            order: 32,
            date: "April 11, 2023",
            isMiniSet: false,
            apiName: "FESTIVAL",
        },
        RETURN_TO_NAXXRAMAS: {
            order: 31,
            date: "February 14, 2023",
            isMiniSet: true,
            apiName: "RETURN_TO_NAXXRAMAS",
        },
        MARCH_OF_THE_LICH_KING: {
            order: 30,
            date: "December 6, 2022",
            isMiniSet: false,
            apiName: "RETURN_OF_THE_LICH_KING",
        },
        MAW_AND_DISORDER: {
            order: 29,
            date: "September 27, 2022",
            isMiniSet: true,
            apiName: "MAW_AND_DISORDER",
        },
        MURDER_AT_CASTLE_NATHRIA: {
            order: 28,
            date: "August 2, 2022",
            isMiniSet: false,
            apiName: "MURDER_AT_CASTLE_NATHRIA",
        },
        THRONE_OF_THE_TIDES: {
            order: 27,
            date: "June 1, 2022",
            isMiniSet: true,
            apiName: "THRONE_OF_THE_TIDES",
        },
        VOYAGE_TO_THE_SUNKEN_CITY: {
            order: 26,
            date: "April 12, 2022",
            isMiniSet: false,
            apiName: "VOYAGE_TO_THE_SUNKEN_CITY",
        },
        ONYXIAS_LAIR: {
            order: 25,
            date: "February 15, 2022",
            isMiniSet: true,
            apiName: "ONYXIAS_LAIR",
        },
        FRACTURED_IN_ALTERAC_VALLEY: {
            order: 24,
            date: "December 7, 2021",
            isMiniSet: false,
            apiName: "ALTERAC_VALLEY",
        },
        DEADMINES: {
            order: 23,
            date: "November 2, 2021",
            isMiniSet: true,
            apiName: "DEADMINES",
        },
        UNITED_IN_STORMWIND: {
            order: 22,
            date: "August 3, 2021",
            isMiniSet: false,
            apiName: "STORMWIND",
        },
        WAILING_CAVERNS: {
            order: 21,
            date: "June 3, 2021",
            isMiniSet: true,
            apiName: "WAILING_CAVERNS",
        },
        FORGED_IN_THE_BARRENS: {
            order: 20,
            date: "March 30, 2021",
            isMiniSet: false,
            apiName: "THE_BARRENS",
        },
        DARKMOON_RACES: {
            order: 19,
            date: "January 21, 2021",
            isMiniSet: true,
            apiName: "DARKMOON_RACES",
        },
        MADNESS_AT_THE_DARKMOON_FAIRE: {
            order: 18,
            date: "November 17, 2020",
            isMiniSet: false,
            apiName: "DARKMOON_FAIRE",
        },
        SCHOLOMANCE_ACADEMY: {
            order: 17,
            date: "August 6, 2020",
            isMiniSet: false,
            apiName: "SCHOLOMANCE",
        },
        ASHES_OF_OUTLAND: {
            order: 16,
            date: "April 7, 2020",
            isMiniSet: false,
            apiName: "BLACK_TEMPLE",
        },
        DESCENT_OF_DRAGONS: {
            order: 15,
            date: "December 10, 2019",
            isMiniSet: false,
            apiName: "DRAGONS",
        },
        SAVIORS_OF_ULDUM: {
            order: 14,
            date: "August 6, 2019",
            isMiniSet: false,
            apiName: "ULDUM",
        },
        RISE_OF_SHADOWS: {
            order: 13,
            date: "April 9, 2019",
            isMiniSet: false,
            apiName: "DALARAN",
        },
        RASTAKHANS_RUMBLE: {
            order: 12,
            date: "December 4, 2018",
            isMiniSet: false,
            apiName: "TROLL",
        },
        THE_BOOMSDAY_PROJECT: {
            order: 11,
            date: "August 7, 2018",
            isMiniSet: false,
            apiName: "BOOMSDAY",
        },
        THE_WITCHWOOD: {
            order: 10,
            date: "April 12, 2018",
            isMiniSet: false,
            apiName: "GILNEAS",
        },
        KOBOLDS_AND_CATACOMBS: {
            order: 9,
            date: "December 7, 2017",
            isMiniSet: false,
            apiName: "LOOTAPALOOZA",
        },
        KNIGHTS_OF_THE_FROZEN_THRONE: {
            order: 8,
            date: "August 10, 2017",
            isMiniSet: false,
            apiName: "ICCA",
        },
        JOURNEY_TO_UNGORO: {
            order: 7,
            date: "April 6, 2017",
            isMiniSet: false,
            apiName: "UNGORO",
        },
        MEAN_STREETS_OF_GADGETZAN: {
            order: 6,
            date: "December 1, 2016",
            isMiniSet: false,
            apiName: "GANGS",
        },
        WHISPERS_OF_THE_OLD_GODS: {
            order: 5,
            date: "April 26, 2016",
            isMiniSet: false,
            apiName: "OG",
        },
        THE_GRAND_TOURNAMENT: {
            order: 4,
            date: "August 24, 2015",
            isMiniSet: false,
            apiName: "TGT",
        },
        GOBLINS_VS_GNOMES: {
            order: 3,
            date: "December 8, 2014",
            isMiniSet: false,
            apiName: "GVG",
        },
        CORE: { order: 2, date: "", isMiniSet: false, apiName: "CORE" },
        LEGACY: { order: 1, date: "", isMiniSet: false, apiName: "LEGACY" },
        VANILLA: { order: 0, date: "", isMiniSet: false, apiName: "VANILLA" },
    };

    // Get unique classes and sort sets by release date
    const classes = Array.from(
        new Set(cards.map((card) => card.cardClass).filter(Boolean)),
    ).sort();

    // Get all sets from setInfo, ensuring we show all sets even if there are no cards yet
    const sets = Object.keys(setInfo).sort(
        (a, b) => setInfo[b].order - setInfo[a].order,
    ); // Sort by order (newest first)

    // Format set name for display
    const formatSetName = (setName: string) => {
        const name = setName
            .split("_")
            .map((word) => {
                if (word === "VS") return "vs";
                if (word === "UNGORO") return "Un'Goro";
                return word.charAt(0) + word.slice(1).toLowerCase();
            })
            .join(" ");

        return setInfo[setName]?.isMiniSet ? `${name} (Mini-set)` : name;
    };

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json",
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const validCards = data.filter(
                    (card: Card) =>
                        card.id &&
                        !card.id.includes("HERO") &&
                        card.type !== "HERO" &&
                        card.set !== "HERO_SKINS",
                );
                setCards(validCards);
                setFilteredCards(validCards);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch cards",
                );
                console.error("Error fetching cards:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    useEffect(() => {
        const filtered = cards.filter((card) => {
            // Class filter
            if (selectedClass && card.cardClass !== selectedClass) {
                return false;
            }

            // Set filter - use apiName for comparison
            if (selectedSet) {
                const apiName = setInfo[selectedSet]?.apiName;
                if (!apiName || card.set !== apiName) {
                    return false;
                }
            }

            // Search query filter
            if (searchTerm) {
                const query = searchTerm.toLowerCase();
                return (
                    card.name.toLowerCase().includes(query) ||
                    (card.text && card.text.toLowerCase().includes(query))
                    // card.rarity.toLowerCase().includes(query) ||
                    // card.type.toLowerCase().includes(query)
                );
            }

            return true;
        });

        setFilteredCards(filtered);
        setPage(1);
        setHasMore(filtered.length > cardsPerPage);
    }, [searchTerm, selectedClass, selectedSet, cards]);

    const handleMouseEnter = (card: Card) => {
        setHoveredCard(card);
        setOverlayVisible(true);

        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        // Attach the mouse move event listener
        window.addEventListener("mousemove", handleMouseMove);

        // Clean up the event listener on mouse leave
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    };

    const handleMouseLeave = () => {
        setOverlayVisible(false);
        setHoveredCard(null);
    };

    const fetchMoreData = () => {
        const nextPage = page + 1;
        setPage(nextPage);
    };

    // Legg til handleSort funksjon
    const handleSort = (newSortBy: string) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };

    const displayedCardsCount = filteredCards.slice(0, page * cardsPerPage).length;
    const totalFilteredCards = filteredCards.length;

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ flexGrow: 1, p: 4, m: 0 }}>
            <img
                src={hearthstoneLogo}
                alt="Hearthstone Logo"
                style={{
                    width: "20%", 
                    height: "auto",
                    margin: "0",
                    padding: "0",
                    display: "block",
                    cursor: "pointer"
                }}
                onClick={() => {
                    setSearchTerm("");
                    setSelectedClass("");
                    setSelectedSet("");
                    setShowActiveCards(false);
                    setSelectedManaCost("");
                    setSortBy("name");
                    setSortOrder("asc");
                    setPage(1);
                }}
            />
            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                }}
            >
                <TextField
                    sx={{ flex: 2 }}
                    variant="outlined"
                    label="Search cards"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                />
                <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Class</InputLabel>
                    <Select
                        value={selectedClass}
                        label="Class"
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <MenuItem value="">All Classes</MenuItem>
                        {classes.map((className) => (
                            <MenuItem key={className} value={className}>
                                {className}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Expansion</InputLabel>
                    <Select
                        value={selectedSet}
                        label="Expansion"
                        onChange={(e) => setSelectedSet(e.target.value)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 600,
                                },
                            },
                        }}
                    >
                        <MenuItem value="">All Sets</MenuItem>
                        {sets.map((setName) => (
                            <MenuItem
                                key={setName}
                                value={setName}
                                sx={{
                                    pl: setInfo[setName]?.isMiniSet ? 4 : 2,
                                    fontSize: setInfo[setName]?.isMiniSet
                                        ? "0.9em"
                                        : "1em",
                                    color: setInfo[setName]?.isMiniSet
                                        ? "text.secondary"
                                        : "text.primary",
                                }}
                            >
                                {formatSetName(setName)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ mb: 3, display: "flex", flexDirection: "row", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showActiveCards}
                                onChange={() =>
                                    setShowActiveCards(!showActiveCards)
                                }
                            />
                        }
                        label="Current rotation only"
                        sx={{ color: "black" }}
                    />
                </Box>

                <RadioGroup
                    row
                    value={selectedManaCost}
                    onChange={(e) => setSelectedManaCost(e.target.value)}
                    sx={{ gap: 1 }}
                >
                    <FormControlLabel
                        value=""
                        control={<Radio />}
                        label="All"
                        sx={{ color: "black" }}
                    />
                    {[1, 2, 3, 4, 5, 6, "7+"].map((cost) => (
                        <FormControlLabel
                            key={cost}
                            value={cost.toString()}
                            control={<Radio />}
                            label={cost.toString()}
                            sx={{ color: "black" }}
                        />
                    ))}
                </RadioGroup>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                {[
                    { value: "name", label: "Name" },
                    { value: "cost", label: "Mana" },
                    { value: "attack", label: "Attack" },
                    { value: "health", label: "Health" }
                ].map((option) => (
                    <Button
                        key={option.value}
                        variant={sortBy === option.value ? "contained" : "outlined"}
                        onClick={() => handleSort(option.value)}
                        endIcon={sortBy === option.value ? (
                            sortOrder === "asc" ? "↑" : "↓"
                        ) : null}
                    >
                        {option.label}
                    </Button>
                ))}
            </Box>

            <Box sx={{ mb: 3, color: 'text.secondary' }}>
                Showing {displayedCardsCount} of {totalFilteredCards} cards
            </Box>

            <InfiniteScroll
                dataLength={filteredCards.slice(0, page * cardsPerPage).length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<CircularProgress />}
                style={{ overflow: "hidden" }}
            >
                <Grid container spacing={2}>
                    {filteredCards.slice(0, page * cardsPerPage).map((card) => (
                        <Grid item key={card.id} xs={12} sm={6} md={4} lg={3}>
                            <Box
                                sx={{
                                    position: "relative",
                                    paddingTop: "100%",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        transition: "transform 0.2s",
                                    },
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${card.id}.png`}
                                    alt={card.name}
                                    onError={(
                                        e: React.SyntheticEvent<HTMLImageElement>,
                                    ) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.style.display = "none";
                                        const parent =
                                            e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.textContent = `${card.name} (Image not available)`;
                                            parent.style.backgroundColor =
                                                "#f0f0f0";
                                            parent.style.display = "flex";
                                            parent.style.alignItems = "center";
                                            parent.style.justifyContent =
                                                "center";
                                            parent.style.padding = "1rem";
                                            parent.style.textAlign = "center";
                                        }
                                    }}
                                    onMouseEnter={() => handleMouseEnter(card)}
                                    onMouseLeave={handleMouseLeave}
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Box>
                        </Grid>
                    ))}

                    {isOverlayVisible && hoveredCard && (
                        <Box
                            sx={{
                                position: "fixed",
                                top: mousePosition.y + 10,
                                left: mousePosition.x + 10,
                                backgroundColor: "gray",
                                borderRadius: "7px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                padding: 2,
                                zIndex: 1000,
                            }}
                        >
                            <h2 style={{ fontWeight: "800", color: "white" }}>
                                {hoveredCard.name}
                            </h2>
                            <p>{hoveredCard.text}</p>
                            <p>{hoveredCard.flavor}</p>
                            <h4>
                                {Object.keys(setInfo).find(key => setInfo[key].apiName === hoveredCard.set) || hoveredCard.set}
                            </h4>
                            <h4>
                                {hoveredCard.cardClass} - {hoveredCard.type} - {hoveredCard.rarity}
                            </h4>
                        </Box>
                    )}
                </Grid>
            </InfiniteScroll>
        </Box>
    );
};

export default HearthstoneGrid;
