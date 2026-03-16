import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud,
    Droplets,
    Activity,
    Utensils,
    Dumbbell,
    ShoppingBag,
    FileText,
    LogOut,
    Menu,
    X,
    User,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Wind,
    Thermometer,
    Zap,
    Sparkles,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useState, useContext, useEffect } from 'react';
import AIChatBot from '../components/AIChatBot';

// ─── Static Meal Guide Data ─────────────────────────────────────────────────
const MEAL_GUIDE = {
    breakfast: [
        {
            name: 'Masala Oats with Veggies',
            calories: 350,
            description: 'A warm, savory bowl of rolled oats cooked with onions, peas, and mild spices.',
            benefits: ['Stabilises blood sugar', 'High in soluble fiber', 'Keeps you full for 3–4 hours', 'Lowers LDL cholesterol'],
            ingredients: ['1 cup rolled oats', '1.5 cups water', '¼ cup peas & carrots', '½ onion (chopped)', 'Turmeric, salt, green chilli'],
        },
        {
            name: 'Scrambled Eggs & Whole-Wheat Toast',
            calories: 380,
            description: 'Classic protein-rich breakfast combining eggs and complex carbs from whole-wheat bread.',
            benefits: ['High-quality complete protein', 'Rich in Vitamin B12 & D', 'Good source of healthy fats', 'Provides sustained energy'],
            ingredients: ['3 whole eggs', '2 slices whole-wheat toast', '1 tsp olive oil', 'Salt, pepper, herbs', '1 tbsp low-fat cheese (optional)'],
        },
        {
            name: 'Curd with Fruits & Nuts',
            calories: 290,
            description: 'Fresh plain curd layered with seasonal fruits and a crunch of nuts.',
            benefits: ['Excellent source of protein & probiotics', 'Supports gut health', 'Rich in calcium', 'Natural sweetness from fruit'],
            ingredients: ['200g plain thick curd', '½ apple or banana', 'Mixed berries', '1 tsp honey (optional)', '5 chopped almonds'],
        },
        {
            name: 'Banana Milkshake / Lassi',
            calories: 410,
            description: 'A thick, creamy blend of banana and milk — a quick energy booster.',
            benefits: ['Fast-absorbing carbs for energy', 'Healthy fats from milk/nuts', 'High in potassium', 'Refreshing and filling'],
            ingredients: ['2 ripe bananas', '1 cup low-fat milk', '5 soaked almonds', '½ tsp honey', 'Dash of cardamom'],
        },
        {
            name: 'Masala Omelette & Brown Bread',
            calories: 340,
            description: 'Egg omelette with onions, chillies, and tomatoes served with whole-wheat bread.',
            benefits: ['Rich in high-quality protein', 'Provides essential healthy fats', 'Fiber from whole grains', 'Keeps you energized'],
            ingredients: ['2 eggs', '2 slices brown bread', '¼ onion, pepper, tomato', 'Turmeric, salt, coriander', '½ tsp oil'],
        },
        {
            name: 'Fruit Custard (Healthy Style)',
            calories: 310,
            description: 'A light dessert-style breakfast with mixed fruits in a thin milk-based custard.',
            benefits: ['Rich in vitamins from diverse fruits', 'Easily digestible', 'Good for hydration', 'Satisfies sweet cravings naturally'],
            ingredients: ['1 cup milk', '1 tsp custard powder', 'Apple, pomegranate, grapes', '1 tsp honey', 'Crushed pistachios'],
        },
        {
            name: 'Besan Chilla with Paneer Filling',
            calories: 390,
            description: 'Savory chickpea flour pancakes stuffed with crumbled, spiced paneer.',
            benefits: ['High plant-based protein', 'Low GI (suitable for diabetics)', 'Gluten-free starch source', 'Rich in iron and fiber'],
            ingredients: ['1 cup gram flour (besan)', '50g crumbled paneer', 'Green chillies, ajwain', 'Grated ginger', 'Fresh coriander'],
        },
        {
            name: 'Poha with Peanuts and Veggies',
            calories: 320,
            description: 'A traditional Indian flattened rice dish, made light and fluffy with crunchy peanuts and peas.',
            benefits: ['Easy to digest', 'Good source of iron', 'Energy-boosting carbs', 'Low in calories'],
            ingredients: ['1 cup flattened rice (poha)', '2 tbsp roasted peanuts', '¼ cup green peas & carrots', 'Curry leaves, mustard seeds', 'Turmeric & lemon juice'],
        },
        {
            name: 'Upma with Mixed Vegetables',
            calories: 330,
            description: 'Semolina dish cooked thick with a medley of chopped vegetables and tempering.',
            benefits: ['Rich in B vitamins', 'Keeps you satiated', 'Good source of plant protein', 'Low GI index when loaded with veggies'],
            ingredients: ['½ cup roasted rava (semolina)', '½ cup diced veggies (beans, carrots)', '1 tsp ghee', 'Green chillies, ginger', 'Fresh coriander'],
        }
    ],
    lunch: [
        {
            name: 'Grilled Chicken Salad',
            calories: 450,
            description: 'Tender grilled chicken breast over a bed of fresh greens, loaded with lean protein and vitamins.',
            benefits: ['Very high in lean protein', 'Low in saturated fat', 'Rich in Vitamin C & K', 'Supports muscle recovery'],
            ingredients: ['200g grilled chicken breast', '2 cups mixed greens', '½ cucumber', '1 tomato', '¼ red onion', '2 tbsp olive oil dressing'],
        },
        {
            name: 'Vegetable Pulao (Brown Rice)',
            calories: 490,
            description: 'One-pot brown rice dish cooked with seasonal vegetables and whole spices.',
            benefits: ['High in complex carbs and fiber', 'Rich in antioxidants', 'Supports healthy digestion', 'Sustainable energy release'],
            ingredients: ['1 cup brown rice', '½ cup beans, carrots, peas', '1 tbsp oil', 'Whole spices (clove, cardamom)', 'Fresh mint'],
        },
        {
            name: 'Chicken Keema Wrap',
            calories: 420,
            description: 'Spiced minced chicken cooked with peas, wrapped in a whole-wheat chapati.',
            benefits: ['Lean high protein source', 'Iron-rich filling', 'Satiating and portable', 'Balanced macros'],
            ingredients: ['1 whole-wheat chapati', '100g minced chicken', 'Onions, tomatoes, peas', 'Garlic-ginger paste', 'Mint chutney'],
        },
        {
            name: 'Brown Rice & Dal',
            calories: 520,
            description: 'Traditional Indian comfort meal — slow-burning brown rice paired with protein-rich dal.',
            benefits: ['High in complex carbohydrates', 'Good plant protein source', 'Rich in manganese', 'Supports digestive health'],
            ingredients: ['1 cup cooked brown rice', '1 cup moong dal', '1 onion & tomato', '1 tsp ghee', 'Cumin, turmeric, coriander powder'],
        },
        {
            name: 'Veg Grilled Sandwich',
            calories: 460,
            description: 'Toasted whole-wheat sandwich filled with cucumber, tomato, and a spread of green chutney.',
            benefits: ['Provides whole grains', 'Fresh vegetable nutrients', 'Low in saturated fat', 'Quick and healthy lunch'],
            ingredients: ['2 slices brown bread', 'Cucumber, tomato, boiled potato', 'Mint-coriander chutney', 'Chaats masala', '1 tsp low-fat butter'],
        },
        {
            name: 'Chickpea Salad (Chana Salad)',
            calories: 380,
            description: 'A refreshing salad made of boiled chickpeas, diced veggies, and a zesty lemon dressing.',
            benefits: ['High in dietary fiber', 'Excellent plant protein', 'Promotes fullness', 'Very low in fat'],
            ingredients: ['1 cup boiled chickpeas', '½ cucumber (diced)', '1 tomato (diced)', '½ red onion (diced)', 'Fresh coriander', 'Lemon juice, chaat masala'],
        },
        {
            name: 'Chicken Pulao (Light & Healthy)',
            calories: 550,
            description: 'Basmati rice cooked with chicken chunks and minimal oil, using natural spices for flavor.',
            benefits: ['High protein and complex carbs', 'Heart healthy if made with less oil', 'Complete meal', 'Rich in Vitamin B-complex'],
            ingredients: ['150g chicken pieces', '1 cup rice', '1 onion', 'Whole spices', 'Green chillies, coriander'],
        },
        {
            name: 'Shakarkandi (Roasted Sweet Potato) Chaat',
            calories: 480,
            description: 'Baked or roasted sweet potatoes with a dash of lime and spices — nutrient-dense lunch.',
            benefits: ['Massive Vitamin A content', 'High in fiber and potassium', 'Great for heart health', 'Natural energy booster'],
            ingredients: ['2 large sweet potatoes', 'Lime juice', 'Rock salt', 'Chaat masala', 'Roasted cumin powder'],
        },
        {
            name: 'Chole (Chickpea) Bowl with Salad',
            calories: 510,
            description: 'Spiced chickpeas served with a side of onions, cucumbers, and tomatoes.',
            benefits: ['Rich in heart-healthy unsaturated fats', 'Plenty of diverse micronutrients', 'Anti-inflammatory ingredients', 'Satisfying crunch'],
            ingredients: ['1 cup boiled chole', '1 onion (chopped)', 'Cucumber, tomato', 'Lemon juice', 'Ginger juliennes'],
        }
    ],
    dinner: {
        veg: [
            {
                name: 'Paneer Rice',
                calories: 520,
                description: 'Fragrant basmati rice cooked with cubes of fresh paneer, peas, and aromatic spices.',
                benefits: ['High in casein protein', 'Good calcium source', 'Rich in phosphorus', 'Filling and satisfying'],
                ingredients: ['1 cup basmati rice', '150g paneer', '½ cup green peas', '1 onion', 'Garam masala', '1 tbsp ghee'],
            },
            {
                name: 'Soya Chunks Rice',
                calories: 490,
                description: 'High-protein soya chunks cooked with spices and mixed into fluffy rice — a bodybuilder\'s favourite veg meal.',
                benefits: ['Extremely high in plant protein', 'Complete amino acid profile', 'Rich in iron', 'Low GI carbs'],
                ingredients: ['1 cup cooked rice', '½ cup soya chunks', '1 onion & tomato', 'Garam masala, chilli powder', '1 tbsp oil'],
            },
            {
                name: 'Palak Paneer with Roti',
                calories: 430,
                description: 'Fresh spinach puree cooked with cubes of paneer and mild spices, served with whole-wheat roti.',
                benefits: ['High in iron & Vitamin K', 'Good plant-based protein', 'Rich in antioxidants', 'Supports bone health'],
                ingredients: ['150g fresh paneer', '2 cups chopped spinach', '2 whole-wheat rotis', 'Garlic, cumin seeds', '1 tsp ghee'],
            },
            {
                name: 'Rajma Curry & Brown Rice',
                calories: 500,
                description: 'Creamy kidney bean curry simmered in tomato-onion gravy — a north-Indian protein staple.',
                benefits: ['High in plant protein & fiber', 'Rich in potassium & magnesium', 'Stabilises blood sugar', 'Promotes heart health'],
                ingredients: ['1 cup cooked rajma', '½ cup brown rice', '2 tomatoes (pureed)', '1 onion', 'Ginger, garlic, cumin, coriander'],
            },
            {
                name: 'Chole (Chickpea Curry) with Multigrain Roti',
                calories: 480,
                description: 'Spiced chickpea curry paired with fiber-rich multigrain flatbreads.',
                benefits: ['Excellent fiber and protein ratio', 'Supports healthy digestion', 'Rich in zinc and folate', 'Very filling'],
                ingredients: ['1 cup cooked chole', '2 multigrain rotis', 'Onion-tomato gravy', 'Chole masala', 'Ginger juliennes'],
            },
            {
                name: 'Vegetable Khichdi with Curd',
                calories: 390,
                description: 'The ultimate healthy comfort food: rice and lentils pressure cooked with abundant vegetables.',
                benefits: ['Easiest meal to digest', 'Gut-friendly probiotics from curd', 'Complete protein combining rice & dal', 'Soothing and restorative'],
                ingredients: ['½ cup rice & moong dal mix', '1 cup mixed veggies (carrots, beans, peas)', '1 tsp ghee', 'Turmeric, cumin', '½ cup plain curd (side)'],
            },
            {
                name: 'Mushroom Matar Masala with Roti',
                calories: 410,
                description: 'A savory curry made of mushrooms and green peas served with soft whole-wheat rotis.',
                benefits: ['Mushrooms provide unique antioxidants', 'Low calorie, high volume', 'Whole-wheat provides complex carbs', 'Heart healthy'],
                ingredients: ['150g button mushrooms', '½ cup green peas', '2 whole-wheat rotis', 'Onion-tomato base', '1 tsp oil', 'Garam masala'],
            },
            {
                name: 'Dal Makhani (Healthy Version) with Brown Rice',
                calories: 460,
                description: 'A lightened-up version of the classic black lentil dish, using milk instead of heavy cream.',
                benefits: ['High in complex carbs', 'Excellent source of iron', 'Slow energy release', 'Vegetarian protein powerhouse'],
                ingredients: ['1 cup black urad dal & kidney beans', '½ cup brown rice', '2 tbsp low-fat milk', '1 tsp ghee', 'Kasuri methi, tomato puree'],
            },
            {
                name: 'Vegetable Chowmein (Hakka Style)',
                calories: 440,
                description: 'Stir-fried noodles with crunchy cabbage, bell peppers, and carrots in a mild sauce.',
                benefits: ['Nutrient-dense buckwheat noodles', 'Loads of micronutrients from veggies', 'Low in bad fats', 'Quick to prepare'],
                ingredients: ['1 cup cooked noodles', '1.5 cups mixed veggies', '1 tbsp low-sodium soy sauce', '1 tsp oil', 'Ginger, garlic'],
            }
        ],
        nonveg: [
            {
                name: 'Grilled Chicken Breast & Brown Rice',
                calories: 580,
                description: 'Classic lean dinner — marinated grilled chicken with complex carbs for complete muscle recovery.',
                benefits: ['Very high in lean protein', 'Low in saturated fat', 'Rich in B3 (Niacin)', 'Supports muscle repair overnight'],
                ingredients: ['250g chicken breast', '1 cup brown rice', '1 tbsp olive oil', 'Paprika, garlic powder', 'Steamed broccoli'],
            },
            {
                name: 'Fish Curry (Rohu / Salmon) & Roti',
                calories: 540,
                description: 'Omega-3-packed fish curry in a light tomato-coconut gravy served with whole-wheat roti.',
                benefits: ['Very high in Omega-3s', 'Excellent protein source', 'Rich in Vitamin D & B12', 'Supports brain health'],
                ingredients: ['200g rohu or salmon fillet', '2 whole-wheat rotis', 'Tomatoes, onion, light coconut milk', 'Turmeric, coriander', 'Mustard seeds'],
            },
            {
                name: 'Egg Bhurji with Multigrain Bread',
                calories: 420,
                description: 'Spiced scrambled eggs (Indian style) with sautéed vegetables — quick, high-protein dinner.',
                benefits: ['Bioavailable protein', 'Rich in choline for brain health', 'High in Vitamin D', 'Boosts metabolism'],
                ingredients: ['4 whole eggs', '3 slices multigrain bread', '1 onion, 1 tomato', 'Green chilli, turmeric, cumin', '1 tsp oil'],
            },
            {
                name: 'Mutton Soup with Steamed Veggies',
                calories: 460,
                description: 'Warming bone broth based soup — loaded with collagen, minerals, and lean meat.',
                benefits: ['Rich in collagen for joints', 'High in zinc & selenium', 'Excellent for post-workout recovery', 'Supports immunity'],
                ingredients: ['200g mutton pieces', 'Carrot, celery, ginger, garlic', '½ cup green beans', 'Black pepper, bay leaf'],
            },
            {
                name: 'Lemon Pepper Fish with Steamed Rice',
                calories: 410,
                description: 'A light, zesty baked white fish fillets served with a portion of steamed rice.',
                benefits: ['Extremely low in fat', 'High protein', 'Good for heart health', 'Rich in Vitamin B2'],
                ingredients: ['200g white fish fillet', '½ cup steamed rice', '1 tsp oil', 'Lemon slices, pepper, garlic powder'],
            },
            {
                name: 'Chicken Tikka with Mint Chutney & Cucumber',
                calories: 450,
                description: 'Oven-roasted marinated chicken chunks served with a refreshing yogurt-mint dip and cucumber slices.',
                benefits: ['Very high protein', 'Low carb option', 'Mint/yogurt aids digestion', 'Highly satiating'],
                ingredients: ['250g chicken breast cubes', '3 tbsp hung curd for marinade', 'Tikka spices', 'Fresh mint, coriander, green chilli', '1 cucumber'],
            },
            {
                name: 'Prawn Curry with Coconut Milk & Wild Rice',
                calories: 530,
                description: 'A luxurious but healthy prawn curry made with light coconut milk.',
                benefits: ['Prawns are rich in antioxidant astaxanthin', 'Coconut milk provides MCT fats', 'Wild rice is highly nutritious', 'High protein'],
                ingredients: ['150g prawns/shrimp', '½ cup wild rice', '¼ cup light coconut milk', 'Curry paste', 'Bell peppers'],
            },
            {
                name: 'Chicken Meatball Curry',
                calories: 400,
                description: 'Juicy chicken meatballs simmered in a light, spiced tomato-onion gravy.',
                benefits: ['High in lean protein', 'Iron-rich gravy', 'Satiating and delicious', 'Rich in Vitamin C'],
                ingredients: ['150g chicken meatballs', 'Onion-tomato gravy', 'Coriander leaves', 'Spices (turmeric, garam masala)', '1 tsp oil'],
            },
            {
                name: 'Tandoori Chicken with Salad',
                calories: 490,
                description: 'A quarter chicken (leg/breast) marinated in tandoori spices and roasted, served with a large fresh salad.',
                benefits: ['Great source of iron and protein', 'Low glycemic load', 'Good for keto/low-carb diets', 'Spices boost metabolism'],
                ingredients: ['250g chicken bone-in piece', 'Tandoori marinade', '2 cups mixed greens, cucumber, tomato', 'Squeeze of lemon', 'Mint sprigs'],
            }
        ],
    },
    snack: [
        {
            name: 'Boiled Eggs (Hard)',
            calories: 155,
            description: 'Simple and effective — hard-boiled eggs are the perfect high-protein snack anytime.',
            benefits: ['Complete protein with all amino acids', 'Rich in healthy fats', 'Portable and quick', 'Boosts satiety'],
            ingredients: ['2 whole eggs (boiled)', 'A pinch of salt & black pepper', 'Optional: chilli flakes or mustard dip'],
        },
        {
            name: 'Handful of Mixed Nuts',
            calories: 200,
            description: 'A mix of almonds, walnuts, cashews — dense in healthy fats and micronutrients.',
            benefits: ['Rich in Omega-3 & Vitamin E', 'Heart-protective fats', 'High in magnesium', 'Excellent anti-inflammatory'],
            ingredients: ['10 almonds', '5 walnuts', '5 cashews', '5 pistachios', 'Optional: 2 dates for sweetness'],
        },
        {
            name: 'Roasted Chana (Chickpeas)',
            calories: 180,
            description: 'Crunchy roasted Bengal gram — high protein Indian snack that beats chips every time.',
            benefits: ['High in plant protein & fiber', 'Very low glycemic index', 'Rich in folate & iron', 'Satisfying and crunchy'],
            ingredients: ['½ cup roasted chana', '½ tsp chaat masala', 'Squeeze of lemon', 'Optional: sliced cucumber & onion'],
        },
        {
            name: 'Banana + Peanut Butter (Pre/Post Workout)',
            calories: 230,
            description: 'Nature\'s energy bar — bananas provide quick carbs while peanut butter adds lasting protein & fat.',
            benefits: ['Instant energy from natural sugars', 'High in potassium for cramp prevention', 'Good protein from PB', 'Perfect recovery snack'],
            ingredients: ['1 large ripe banana', '1 tbsp natural peanut butter', 'Optional: drizzle of honey'],
        },
        {
            name: 'Apple Slices with Peanut Butter',
            calories: 210,
            description: 'Crisp apple slices paired with creamy peanut butter for a sweet and savory crunch.',
            benefits: ['Rich in pectin (fiber)', 'Peanut butter offers healthy fats', 'Balances blood sugar', 'Great mid-afternoon energy'],
            ingredients: ['1 medium apple', '1.5 tbsp peanut butter', 'Dash of cinnamon'],
        },
        {
            name: 'Cottage Cheese (Paneer) with Black Pepper',
            calories: 190,
            description: 'A small bowl of raw or pan-tossed paneer cubes sprinkled with black pepper and salt.',
            benefits: ['Supreme source of slow-digesting casein protein', 'Excellent night-time snack', 'Rich in calcium', 'Very low carb'],
            ingredients: ['100g low-fat paneer', 'Crushed black pepper', 'Pinch of pink salt'],
        },
        {
            name: 'Makhana (Fox Nuts) Roasted in Ghee',
            calories: 140,
            description: 'Lotus seeds roasted lightly in ghee with a sprinkle of turmeric and salt. The best popcorn alternative.',
            benefits: ['Extremely low in calories', 'High in antioxidants', 'Anti-aging properties', 'Light and easily digestible'],
            ingredients: ['1.5 cups dry makhana', '½ tsp ghee', 'Turmeric, black salt, pepper'],
        },
        {
            name: 'Dark Chocolate (70%+) & Walnuts',
            calories: 220,
            description: 'A couple of squares of high-quality dark chocolate paired with brain-boosting walnuts.',
            benefits: ['Dark chocolate lowers blood pressure', 'Walnuts are top-tier for brain health', 'Cures sweet tooth', 'Massive antioxidant hit'],
            ingredients: ['2 squares (20g) dark chocolate (70% or more)', '5 whole walnuts'],
        },
        {
            name: 'Buttermilk (Chaas) & Roasted Makhana',
            calories: 250,
            description: 'A refreshing glass of spiced buttermilk served with crunchy roasted fox nuts.',
            benefits: ['High protein from buttermilk', 'Calorie-efficient makhana', 'Aids digestion', 'Hydrating snack'],
            ingredients: ['1 glass buttermilk', '1 cup roasted makhana', 'Black salt, cumin powder'],
        }
    ],
};


// ─── Expandable Meal Card component ─────────────────────────────────────────
function MealDetailCard({ item, accentColor = '#34d399', isFavorite, onToggleFavorite, showLogButton, onLog, logging, onOpenChange }) {
    const [open, setOpen] = useState(false);

    const handleToggle = (e) => {
        const newState = !open;
        setOpen(newState);
        if (onOpenChange) onOpenChange(newState);
    };

    return (
        <motion.div
            layout
            onClick={handleToggle}
            className="glass p-5 rounded-2xl cursor-pointer relative overflow-hidden group border border-white/10"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Background Glow */}
            <div
                className="absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: accentColor }}
            />

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary/80 border border-white/5">
                        <Utensils size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-100 text-base">{item.name}</div>
                        <div className="text-[11px] font-semibold tracking-wider uppercase opacity-60" style={{ color: accentColor }}>
                            {item.calories} kcal • {open ? 'click to collapse' : 'click to expand'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onToggleFavorite && (
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                            className="p-1 text-xl"
                        >
                            {isFavorite ? <motion.div animate={{ scale: [1, 1.2, 1] }}><TrendingUp size={20} className="text-primary" /></motion.div> : <Droplets size={20} className="text-slate-600" />}
                        </motion.button>
                    )}
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        className="opacity-50"
                    >
                        <ChevronRight size={18} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 mt-2 border-t border-white/10"
                    >
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{item.description}</p>

                        {/* Macros display for AI/Metric-rich meals */}
                        {(item.protein !== undefined || item.carbs !== undefined || item.fat !== undefined) && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { label: 'Protein', value: (item.protein || 0) + 'g', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
                                    { label: 'Carbs', value: (item.carbs || 0) + 'g', color: '#93c5fd', bg: 'rgba(96,165,250,0.1)' },
                                    { label: 'Fat', value: (item.fat || 0) + 'g', color: '#fde68a', bg: 'rgba(250,204,21,0.1)' }
                                ].map(m => (
                                    <div key={m.label} className="p-2 rounded-lg border border-white/5 text-center" style={{ backgroundColor: m.bg }}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: m.color }}>{m.label}</div>
                                        <div className="text-sm font-black text-white">{m.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showLogButton && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onLog(); }}
                                disabled={logging}
                                className="w-full py-2.5 mb-4 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {logging ? 'Logging...' : '✓ Log This Meal'}
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="font-bold text-[10px] uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1">
                                    <Activity size={12} /> Benefits
                                </div>
                                <ul className="space-y-1.5">
                                    {(item.benefits || []).map((b, i) => (
                                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                            <span className="text-emerald-500 mt-0.5">•</span>{b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="font-bold text-[10px] uppercase tracking-widest text-sky-400 mb-2 flex items-center gap-1">
                                    <Utensils size={12} /> Ingredients
                                </div>
                                <ul className="space-y-1.5">
                                    {(item.ingredients || []).map((ing, i) => (
                                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                            <span className="text-sky-500 mt-0.5">•</span>{ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Meal Carousel component ───────────────────────────────────────────────
function MealCarousel({ items, accentColor = '#34d399', favorites, handleToggleFavorite, showLogButton, handleLogMeal, loggingMeal, type }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000); // 5 seconds auto-skip
        return () => clearInterval(timer);
    }, [items.length, isPaused]);

    const handleNext = () => {
        setIsPaused(true);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setIsPaused(true);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="relative w-[100%] max-w-4xl mx-auto flex flex-col items-center">
            {/* Main Card Wrapper */}
            <div className="w-full relative px-14 py-2">
                {/* Left Arrow */}
                <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-20 backdrop-blur-md">
                    <ChevronLeft size={20} />
                </button>

                {/* The Card */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <MealDetailCard
                                item={currentItem}
                                accentColor={accentColor}
                                isFavorite={favorites?.includes(currentItem.name)}
                                onToggleFavorite={handleToggleFavorite ? () => handleToggleFavorite(currentItem.name) : undefined}
                                showLogButton={showLogButton}
                                onLog={handleLogMeal ? () => handleLogMeal(type, currentItem) : undefined}
                                logging={loggingMeal === type}
                                onOpenChange={(isOpen) => setIsPaused(isOpen)}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Arrow */}
                <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-20 backdrop-blur-md">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Status Bar / Indicators */}
            <div className="flex gap-2 mt-4 justify-center">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative cursor-pointer`}
                        style={{
                            width: idx === currentIndex ? '32px' : '12px',
                            backgroundColor: 'rgba(255,255,255,0.15)'
                        }}
                        onClick={() => {
                            setIsPaused(true);
                            setCurrentIndex(idx);
                        }}
                    >
                        {idx === currentIndex && !isPaused && (
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full rounded-full absolute top-0 left-0"
                                style={{ backgroundColor: accentColor }}
                                key={`progress-${currentIndex}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Fallback meals shown when API returns no data ──────────────────────────
const FALLBACK_MEALS = {
    meals: {
        breakfast: { name: 'Egg Bhurji & Brown Bread', calories: 350, protein: 24, carbs: 32, fat: 12 },
        lunch: { name: 'Dal Tadka & Brown Rice', calories: 450, protein: 18, carbs: 62, fat: 14 },
        dinner: { name: 'Chicken Curry & Roti', calories: 500, protein: 48, carbs: 22, fat: 10 },
        snack: { name: 'Roasted Makhana', calories: 140, protein: 4, carbs: 27, fat: 2 }
    },
    health_tips: [
        "Drink 8 glasses of water daily.",
        "Eat more fiber-rich vegetables.",
        "Maintain a consistent sleep schedule.",
        "Prioritize lean protein in every meal."
    ],
    ai_insight: "Maintaining a balanced intake of proteins and complex carbs is key to sustained energy levels throughout the day."
};

// ─── Main Dashboard Component ────────────────────────────────────────────────

// ─── Workout Data ─────────────────────────────────────────────────────────────
const WORKOUT_GUIDE = {
    chest: {
        icon: '', label: 'Chest', color: '#f87171', glow: 'rgba(248,113,113,0.2)',
        exercises: [
            { name: 'Flat Barbell Bench Press', sets: '4 × 8–10', muscle: 'Overall Chest', tip: 'Keep feet flat, arch natural, grip shoulder-width.' },
            { name: 'Incline Dumbbell Press', sets: '3 × 10–12', muscle: 'Upper Chest', tip: 'Control the descent — 2 sec down, explode up.' },
            { name: 'Cable Fly (Low → High)', sets: '3 × 15', muscle: 'Inner / Lower Chest', tip: 'Squeeze hard at peak, no swinging.' },
            { name: 'Push-Ups (Wide Grip)', sets: '3 × 20', muscle: 'Outer Chest', tip: 'Full range of motion — chest touches the floor.' },
            { name: 'Decline Bench Press', sets: '3 × 10', muscle: 'Lower Chest', tip: 'Feet locked on bench, controlled reps.' },
        ],
    },
    triceps: {
        icon: '', label: 'Triceps', color: '#fb923c', glow: 'rgba(251,146,60,0.2)',
        exercises: [
            { name: 'Tricep Rope Pushdown', sets: '4 × 12', muscle: 'All 3 Heads', tip: 'Pull rope apart at the bottom for full contraction.' },
            { name: 'Overhead Dumbbell Extension', sets: '3 × 12', muscle: 'Long Head', tip: 'Keep elbows close, lower behind head slowly.' },
            { name: 'Close-Grip Bench Press', sets: '3 × 10', muscle: 'Medial Head', tip: 'Grip inside shoulder-width, keep elbows tucked.' },
            { name: 'Skull Crushers (EZ Bar)', sets: '3 × 10', muscle: 'Lateral Head', tip: 'Lower bar to forehead, extend fully at top.' },
            { name: 'Dips (Tricep Focus)', sets: '3 × 15', muscle: 'Overall Tricep', tip: 'Stay upright, less forward lean for tricep focus.' },
        ],
    },
    back: {
        icon: '', label: 'Back', color: '#34d399', glow: 'rgba(52,211,153,0.2)',
        exercises: [
            { name: 'Deadlift', sets: '4 × 5', muscle: 'Full Back, Hamstrings', tip: 'Neutral spine — hinge at hips, drive through heels.' },
            { name: 'Pull-Ups / Lat Pulldown', sets: '4 × 10', muscle: 'Lats (Width)', tip: 'Pull elbows to hips, squeeze lats at the bottom.' },
            { name: 'Seated Cable Row', sets: '3 × 12', muscle: 'Mid-Back Thickness', tip: 'Full stretch forward, full pull back — chest proud.' },
            { name: 'Single-Arm Dumbbell Row', sets: '3 × 12 each', muscle: 'Rhomboids, Lats', tip: 'Drive elbow up and back — not out.' },
            { name: 'Face Pulls (Cable)', sets: '3 × 15', muscle: 'Rear Delts, Traps', tip: 'Pull to nose level, thumbs finish behind ears.' },
        ],
    },
    biceps: {
        icon: '', label: 'Biceps', color: '#60a5fa', glow: 'rgba(96,165,250,0.2)',
        exercises: [
            { name: 'Barbell Curl', sets: '4 × 10', muscle: 'Overall Bicep', tip: 'Strict form — no swinging, elbows pinned to sides.' },
            { name: 'Incline Dumbbell Curl', sets: '3 × 12', muscle: 'Long Head (Peak)', tip: 'Incline stretches the long head for better peak contraction.' },
            { name: 'Hammer Curl', sets: '3 × 12', muscle: 'Brachialis, Forearm', tip: 'Neutral grip throughout — do not rotate wrist.' },
            { name: 'Concentration Curl', sets: '3 × 12', muscle: 'Bicep Peak', tip: 'Elbow on inner thigh, full squeeze at top.' },
            { name: 'Cable Curl (Low Pulley)', sets: '3 × 15', muscle: 'Overall Bicep', tip: 'Constant tension through the full range.' },
        ],
    },
    legs: {
        icon: '', label: 'Legs', color: '#a78bfa', glow: 'rgba(167,139,250,0.2)',
        exercises: [
            { name: 'Barbell Squat', sets: '4 × 8', muscle: 'Quads, Glutes, Core', tip: 'Knees track over toes, break parallel for full glute activation.' },
            { name: 'Romanian Deadlift', sets: '3 × 10', muscle: 'Hamstrings, Glutes', tip: 'Push hips back — feel the hamstring stretch before driving up.' },
            { name: 'Leg Press', sets: '3 × 12', muscle: 'Quads, Glutes', tip: 'Feet shoulder-width, never lock out knees at the top.' },
            { name: 'Walking Lunges', sets: '3 × 10 each', muscle: 'Quads, Glutes, Balance', tip: 'Step long enough that front shin stays vertical.' },
            { name: 'Seated Calf Raise', sets: '4 × 15', muscle: 'Soleus (Lower Calf)', tip: 'Pause 1 sec at bottom stretch and 1 sec at top squeeze.' },
        ],
    },
    shoulders: {
        icon: '', label: 'Shoulders', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)',
        exercises: [
            { name: 'Overhead Barbell Press', sets: '4 × 8', muscle: 'All 3 Deltoid Heads', tip: 'Core braced, press in a straight line over head.' },
            { name: 'Dumbbell Lateral Raise', sets: '4 × 15', muscle: 'Lateral (Side) Delt', tip: 'Slight forward bend, lead with elbows not wrists.' },
            { name: 'Rear Delt Fly', sets: '3 × 15', muscle: 'Posterior Delt', tip: 'Hinge at hips 45°, arms arc wide — squeeze at the top.' },
            { name: 'Arnold Press', sets: '3 × 12', muscle: 'Full Deltoid', tip: 'Rotate palms outward as you press — big range of motion.' },
            { name: 'Upright Row', sets: '3 × 12', muscle: 'Medial Delt, Traps', tip: 'Elbows lead and flare out, bar stays close to body.' },
        ],
    },
    abs: {
        icon: '', label: 'Abs', color: '#2dd4bf', glow: 'rgba(45,212,191,0.2)',
        exercises: [
            { name: 'Plank', sets: '3 × 60 sec', muscle: 'Deep Core, Transverse Abs', tip: 'Squeeze glutes and abs tight — think "pull belly to spine".' },
            { name: 'Hanging Leg Raise', sets: '4 × 12', muscle: 'Lower Abs, Hip Flexors', tip: 'Control the descent — no swinging.' },
            { name: 'Cable Crunch', sets: '3 × 15', muscle: 'Upper Abs', tip: 'Round your spine on the way down — not just hip flexion.' },
            { name: 'Russian Twists', sets: '3 × 20 total', muscle: 'Obliques', tip: 'Feet off floor for harder challenge — rotate through torso.' },
            { name: 'Ab Wheel Rollout', sets: '3 × 10', muscle: 'Full Core', tip: 'Hips low — roll until hips nearly touch floor, pull back slowly.' },
        ],
    },
};

// ─── WorkoutCard ─────────────────────────────────────────────────────────────
function WorkoutCard({ exercise, accentColor, glow }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            layout
            onClick={() => setOpen(o => !o)}
            className="glass rounded-xl p-4 cursor-pointer relative overflow-hidden group border border-white/5"
            whileHover={{ scale: 1.02 }}
            animate={{
                backgroundColor: open ? `rgba(255, 255, 255, 0.05)` : "rgba(255, 255, 255, 0.02)",
                borderColor: open ? `${accentColor}44` : "rgba(255, 255, 255, 0.05)"
            }}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className="w-2 h-2 rounded-full shadow-lg"
                        style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                    />
                    <div>
                        <div className="font-bold text-slate-100 text-sm leading-tight">{exercise.name}</div>
                        <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1" style={{ color: accentColor }}>{exercise.muscle}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-white/5 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 text-slate-300">
                        {exercise.sets}
                    </span>
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        className="opacity-40"
                    >
                        <ChevronRight size={14} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/5"
                    >
                        <div className="bg-white/5 rounded-lg p-3 flex gap-2">
                            <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-slate-400 text-xs leading-relaxed italic">{exercise.tip}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function Dashboard() {
    const { user, logout, setUser } = useContext(AuthContext);
    const [city, setCity] = useState('New York');
    const [inputCity, setInputCity] = useState('');
    const [mealPlan, setMealPlan] = useState(null);
    const [healthTips, setHealthTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('all');
    const [hasSearchedWeather, setHasSearchedWeather] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);

    const handleToggleFavorite = (mealName) => {
        setFavorites(prev =>
            prev.includes(mealName)
                ? prev.filter(n => n !== mealName)
                : [...prev, mealName]
        );
    };

    // mapping sidebar id → section key
    const SECTION_MAP = {
        'section-top': 'all',
        'section-weather': 'weather',
        'section-ai-meal': 'ai-meal',
        'section-workout': 'workout',
        'section-meal-guide': 'meal-guide',
        'section-breakfast': 'breakfast',
        'section-lunch': 'lunch',
        'section-dinner': 'dinner',
        'section-snacks': 'snacks',
    };

    const navigate = useNavigate();

    // ─── Water Tracker ───
    const [waterCount, setWaterCount] = useState(0);
    useEffect(() => {
        if (user && user.water_intake !== undefined) {
            setWaterCount(user.water_intake);
        }
    }, [user]);

    const handleWaterIncrement = async () => {
        if (waterCount >= 8) return;
        const newCount = waterCount + 1;
        setWaterCount(newCount);
        try {
            await apiClient.post('/users/me/water', { water_intake: newCount });
        } catch (err) {
            console.error('Failed to update water intake', err);
        }
    };

    const handleWaterReset = async () => {
        setWaterCount(0);
        try {
            await apiClient.post('/users/me/water', { water_intake: 0 });
        } catch (err) {
            console.error('Failed to update water intake', err);
        }
    };

    const handleExportPDF = () => {
        const username = user?.username || 'User';
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Use AI meal data if available
        const aiMealsAvailable = mealPlan && mealPlan.meals;
        const aiMeals = aiMealsAvailable ? mealPlan.meals : null;

        const buildMealSection = (type, meals) => {
            if (!meals || meals.length === 0) return '';
            return `
            <div style="margin-bottom:30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
                <h3 style="font-size:16px; font-weight:bold; text-transform:uppercase; margin-bottom:15px; color:#000;">${type}</h3>
                ${meals.map(meal => `
                    <div style="margin-bottom:20px; page-break-inside:avoid;">
                        <div style="font-size:18px; font-weight:bold; color:#000; margin-bottom:5px;">• ${meal.name || 'N/A'}</div>
                        <div style="font-size:12px; color:#000; margin-bottom:10px;">${meal.description || ''}</div>
                        <div style="font-size:12px; font-weight:bold; margin-bottom:10px;">
                            Calories: ${meal.calories || 0} kcal | Protein: ${meal.protein || 0}g | Carbs: ${meal.carbs || 0}g | Fat: ${meal.fat || 0}g
                        </div>
                        ${meal.benefits ? `
                            <div style="font-size:11px; margin-top:5px;">
                                <strong>Benefits:</strong>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    ${meal.benefits.map(b => `<li style="margin-bottom:2px;">${b}</li>`).join('')}
                                </ul>
                            </div>` : ''}
                        ${meal.ingredients ? `
                            <div style="font-size:11px; margin-top:5px;">
                                <strong>Ingredients:</strong>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    ${meal.ingredients.map(ing => `<li style="margin-bottom:2px;">${ing}</li>`).join('')}
                                </ul>
                            </div>` : ''}
                    </div>
                `).join('')}
            </div>`;
        };

        // Prepare data for export
        let sections = '';
        if (aiMealsAvailable) {
            sections += buildMealSection('Breakfast', [aiMeals.breakfast]);
            sections += buildMealSection('Lunch', [aiMeals.lunch]);
            sections += buildMealSection('Dinner', [aiMeals.dinner]);
            sections += buildMealSection('Snacks', [aiMeals.snack]);
        } else {
            // Fallback: Show top 2 items from each guide category
            sections += buildMealSection('Breakfast Options', MEAL_GUIDE.breakfast.slice(0, 2));
            sections += buildMealSection('Lunch Options', MEAL_GUIDE.lunch.slice(0, 2));
            sections += buildMealSection('Dinner (Veg) Options', MEAL_GUIDE.dinner.veg.slice(0, 2));
            sections += buildMealSection('Heathy Snack Options', MEAL_GUIDE.snack.slice(0, 2));
        }

        const htmlContent = `
        <div style="font-family:serif; padding:40px; color:#000; background:#fff; line-height:1.6;">
            <div style="border-bottom:3px solid #000; padding-bottom:15px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:flex-end;">
                <h1 style="margin:0; font-size:32px; font-weight:bold; text-transform:uppercase;">Dietary Protocol</h1>
                <div style="text-align:right;">
                    <div style="font-size:14px; font-weight:bold;">${username}</div>
                    <div style="font-size:12px;">${today}</div>
                </div>
            </div>
            
            <div style="margin-bottom:40px; border: 1px solid #000; padding: 20px;">
                <h3 style="margin:0 0 15px; font-size:18px; font-weight:bold; text-transform:uppercase; border-bottom: 1px solid #000; padding-bottom: 5px;">Biometric Profile</h3>
                <div style="display:flex; gap:30px; font-size:14px;">
                    <div>Weight: <strong>${user?.weight || '--'} kg</strong></div>
                    <div>Height: <strong>${user?.height || '--'} cm</strong></div>
                    <div>Goal: <strong>${(user?.goal || 'maintain').replace('_', ' ').toUpperCase()}</strong></div>
                </div>
            </div>

            <h2 style="font-size:24px; font-weight:bold; text-transform:uppercase; margin-bottom:20px; border-bottom: 2px solid #000; padding-bottom: 10px;">Recommended Meal Plan</h2>
            ${sections}

            <div style="margin-top:50px; border-top:1px solid #000; padding-top:20px; text-align:center; font-size:11px; font-style:italic;">
                "Consistency is the foundation of progress."
                <br>Generated by Smart Food Diet System © 2026
            </div>
        </div>`;

        const el = document.createElement('div');
        el.innerHTML = htmlContent;
        document.body.appendChild(el);

        const opt = {
            margin: 10,
            filename: `Diet_Plan_${username}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(el).save().then(() => {
            document.body.removeChild(el);
        });
    };

    const [loggingMeal, setLoggingMeal] = useState(null);
    const handleLogMeal = async (type, meal) => {
        setLoggingMeal(type);
        try {
            await apiClient.post('/users/me/meals', {
                meal_type: type,
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat
            });
            const res = await apiClient.get('/users/me');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to log meal', err);
        } finally {
            setLoggingMeal(null);
        }
    };

    const handleResetMacros = async () => {
        setShowResetModal(false);
        try {
            const res = await apiClient.delete('/users/me/meals/today');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to reset macros', err);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const consumedMacros = (user?.meal_logs || []).filter(m => m.date === todayStr).reduce((acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const user_metrics = user?.health_metrics;

    useEffect(() => {
        const fetchMealPlan = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/recommendations/meal-plan?city=${city}`);
                setMealPlan(response.data);
                setHealthTips(response.data.health_tips || FALLBACK_MEALS.health_tips);
            } catch (err) {
                console.error('Error fetching meal plan:', err);
                setError('Backend temporarily unavailable. Using fallback data.');
                setMealPlan(FALLBACK_MEALS);
                setHealthTips(FALLBACK_MEALS.health_tips);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchMealPlan();
    }, [user, city]);

    const handleCitySubmit = (e) => {
        e.preventDefault();
        if (inputCity.trim()) {
            setCity(inputCity.trim());
            setHasSearchedWeather(true);
        }
    };

    if (loading && !mealPlan) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Personalising your dashboard...</p>
                </div>
            </div>
        );
    }

    // We don't block render on error anymore, we use FALLBACK_MEALS instead
    // if (error && !mealPlan) { ... } 

    const { meals, weather } = mealPlan || {};

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-[#020617]/80 backdrop-blur-xl border-r border-white/5 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Activity className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic tracking-tighter">SMART DIET</span>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'section-top', icon: <TrendingUp size={20} />, label: 'Overview' },
                            { id: 'section-weather', icon: <Cloud size={20} />, label: 'Weather & Mood' },
                            { id: 'section-ai-meal', icon: <Sparkles size={20} />, label: 'AI Meal Plan' },
                            { id: 'section-meal-guide', icon: <Utensils size={20} />, label: 'Full Meal Guide' },
                            { id: 'section-workout', icon: <Dumbbell size={20} />, label: 'Workout Center' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(SECTION_MAP[item.id]);
                                    setSidebarOpen(false);
                                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeSection === SECTION_MAP[item.id] ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className={activeSection === SECTION_MAP[item.id] ? 'text-white' : 'group-hover:text-primary transition-colors'}>
                                    {item.icon}
                                </span>
                                <span className="font-bold text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="absolute bottom-8 left-8 right-8">
                        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm bg-white/5 border border-white/5">
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 min-h-screen p-4 lg:p-8">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1 italic tracking-tighter uppercase">Welcome back, {user?.full_name || user?.username}! 👋</h1>
                            <p className="text-slate-400 font-medium">Here's your nutritional overview for today.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary border border-white/10">
                            <User size={24} />
                        </div>
                        <div className="pr-4 border-r border-white/10 mr-4">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target</div>
                            <div className="text-sm font-black text-white">{user_metrics?.target_calories || 2400} kcal</div>
                        </div>
                        <div className="pr-2">
                            <button onClick={() => navigate('/profile')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Update Profile</button>
                        </div>
                    </div>
                </header>

                <div className="max-w-[1400px] mx-auto">
                    {/* Welcome Animation */}
                    <AnimatePresence>
                        {showWelcome && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-transparent border border-primary/20 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-50 hover:opacity-100 cursor-pointer" onClick={() => setShowWelcome(false)}>
                                    <X size={16} />
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Zap size={30} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white mb-1">Stay consistent, stay healthy!</h2>
                                        <p className="text-slate-400 text-sm font-medium">You've hit {waterCount}/8 glasses of water today. Keep it up!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleWaterIncrement()}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-105 transition-all text-sm"
                                >
                                    Log Water Intake
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dashboard Sections Wrapper */}
                    {(activeSection === 'all' || activeSection === 'weather') && (
                        <div id="section-top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Algorithm Health Score */}
                            <div className="card-glass relative overflow-hidden" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(52,211,153,0.1), rgba(15,118,110,0.1))' }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Sparkles size={18} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Score</h3>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <svg width="100" height="100" className="transform -rotate-90">
                                            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                                            <motion.circle
                                                cx="50" cy="50" r="45"
                                                stroke="url(#scoreGradient)"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray="283"
                                                initial={{ strokeDashoffset: 283 }}
                                                animate={{ strokeDashoffset: 283 - (283 * (mealPlan?.health_score?.score || 0)) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#3b82f6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{mealPlan?.health_score?.score || 0}</span>
                                            <span style={{ fontSize: '0.6rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>{mealPlan?.health_score?.rating || 'Calculating...'}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', lineHeight: 1.4, textAlign: 'center', fontStyle: 'italic' }}>
                                        {mealPlan?.health_score?.description || 'Loading AI health assessment...'}
                                    </p>
                                </div>
                            </div>

                            {/* Weather */}
                            <div className="weather-container" style={{ padding: '1.5rem', borderRadius: 18, background: 'linear-gradient(135deg,rgba(59,130,246,0.65),rgba(14,116,144,0.72))', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.25)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(147,197,253,0.3)', paddingBottom: '0.6rem', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.4rem' }}>🌞</span> Weather Center
                                    </h3>
                                    <form onSubmit={handleCitySubmit} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#bfdbfe', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>State / Area</span>
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                type="text"
                                                placeholder={`e.g. ${city}`}
                                                style={{ flex: 1, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', outline: 'none', fontSize: '0.85rem' }}
                                                value={inputCity}
                                                onChange={e => setInputCity(e.target.value)}
                                            />
                                            <button type="submit" disabled={weatherLoading} style={{ background: weatherLoading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.28)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: weatherLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                                                {weatherLoading ? '…' : 'Set'}
                                            </button>
                                        </div>
                                    </form>
                                    {weatherLoading ? (
                                        <div style={{ color: '#bfdbfe', fontSize: '0.9rem' }}>Fetching weather…</div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{weather?.city}</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#bfdbfe', marginBottom: '0.25rem' }}>{weather?.temperature}°C</div>
                                            <div style={{ fontSize: '1rem', textTransform: 'capitalize', fontWeight: 500 }}>{weather?.condition}</div>
                                        </>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(147,197,253,0.25)' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>Real-time Weather</span>
                                    <span style={{ background: 'rgba(255,255,255,0.18)', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{weather?.type}</span>
                                </div>
                                {weather?.type && hasSearchedWeather && (
                                    <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0fdf4', marginBottom: '0.7rem' }}>
                                            Based on weather the perfect {weather.type.toUpperCase() === 'HOT' ? 'Cool' : 'Hot'} item is {weather.type.toUpperCase() === 'HOT' ? 'Watermelon Feta Salad' : 'Spicy Chicken Stew'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Daily Progress & Macros */}
                            <div className="card-glass relative min-h-[400px]" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(52,211,153,0.2)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                    <h3 style={{ color: '#a7f3d0', fontWeight: 700, margin: 0 }}>Today's Macros</h3>
                                    <button
                                        onClick={() => setShowResetModal(true)}
                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                        title="Reset Daily Macros"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#6ee7b7' }}>Calories Consumed</span>
                                        <span style={{ color: '#f0fdf4', fontWeight: 700 }}>{consumedMacros.calories} / {user_metrics?.target_calories || 0}</span>
                                    </div>
                                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                                        <div style={{ width: `${Math.min((consumedMacros.calories / (user_metrics?.target_calories || 1)) * 100, 100)}%`, height: '100%', background: 'linear-gradient(to right,#34d399,#38bdf8)', borderRadius: 999, transition: 'width 1s ease-out' }} />
                                    </div>

                                    {/* PIE CHART */}
                                    <div style={{ flex: 1, position: 'relative', minHeight: '120px' }}>
                                        {consumedMacros.protein === 0 && consumedMacros.carbs === 0 && consumedMacros.fat === 0 ? (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.6 }}>No meals logged yet today</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Protein', value: consumedMacros.protein * 4, color: '#fb923c' },
                                                            { name: 'Carbs', value: consumedMacros.carbs * 4, color: '#93c5fd' },
                                                            { name: 'Fat', value: consumedMacros.fat * 9, color: '#fde68a' }
                                                        ]}
                                                        cx="50%" cy="50%"
                                                        innerRadius={35} outerRadius={50}
                                                        paddingAngle={5} dataKey="value"
                                                    >
                                                        {[
                                                            { name: 'Protein', color: '#fb923c' },
                                                            { name: 'Carbs', color: '#93c5fd' },
                                                            { name: 'Fat', color: '#fde68a' }
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: 'rgba(17,34,51,0.9)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.1rem', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#fb923c' }}>■ {consumedMacros.protein}g P</span>
                                        <span style={{ color: '#93c5fd' }}>■ {consumedMacros.carbs}g C</span>
                                        <span style={{ color: '#fde68a' }}>■ {consumedMacros.fat}g F</span>
                                    </div>
                                </div>
                            </div>

                            {/* Water Tracker Widget */}
                            <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                    <h3 style={{ color: '#bae6fd', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ fontSize: '1.4rem' }}>💧</span> Water Tracker
                                    </h3>
                                    <button
                                        onClick={handleWaterReset}
                                        style={{ background: 'none', border: 'none', color: '#7dd3fc', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                                    >Reset</button>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f9ff', marginBottom: '0.5rem' }}>{waterCount} <span style={{ fontSize: '1rem', color: '#bae6fd', fontWeight: 600 }}>/ 8 Glasses</span></div>
                                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: 14, height: 28, borderRadius: 4,
                                                    background: i < waterCount ? 'linear-gradient(to bottom, #38bdf8, #0ea5e9)' : 'rgba(255,255,255,0.1)',
                                                    transition: 'all 0.3s ease',
                                                    border: '1px solid rgba(56,189,248,0.2)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleWaterIncrement}
                                        disabled={waterCount >= 8}
                                        style={{
                                            padding: '0.6rem 2rem', background: waterCount >= 8 ? 'rgba(56,189,248,0.2)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                            color: '#fff', border: 'none', borderRadius: 999, fontWeight: 700, cursor: waterCount >= 8 ? 'not-allowed' : 'pointer',
                                            boxShadow: waterCount >= 8 ? 'none' : '0 4px 12px rgba(14,165,233,0.3)', transition: 'all 0.2s', width: '100%'
                                        }}
                                    >
                                        {waterCount >= 8 ? 'Goal Met! 🎉' : '+ Add Glass'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Meal Plan Section */}
                    {(activeSection === 'all' || activeSection === 'ai-meal') && (
                        <div id="section-ai-meal" className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
                            <div className="xl:col-span-3">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">AI RECOMMENDED MEAL PLAN</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={handleExportPDF}
                                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                                        >
                                            <FileText size={14} /> Export PDF
                                        </button>
                                        <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">Updated Today</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
                                        const meal = meals?.[type] || FALLBACK_MEALS[type] || null;
                                        if (!meal) return <div key={type} className="flex flex-col items-center justify-center h-24 text-slate-500 italic text-sm">No recommendation currently</div>;

                                        return (
                                            <div key={type} className="flex flex-col gap-2">
                                                <div className="self-start text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 backdrop-blur-md">
                                                    {type}
                                                </div>
                                                <MealDetailCard
                                                    item={meal}
                                                    accentColor={type === 'breakfast' ? '#34d399' : type === 'lunch' ? '#38bdf8' : type === 'dinner' ? '#10b981' : '#a78bfa'}
                                                    isFavorite={favorites.includes(meal.name)}
                                                    onToggleFavorite={() => handleToggleFavorite(meal.name)}
                                                    showLogButton={true}
                                                    onLog={() => handleLogMeal(type, meal)}
                                                    logging={loggingMeal === type}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Health Tips & Quick Facts */}
                            <div className="flex flex-col gap-6">
                                <div className="card-glass p-8 border-primary/20 bg-primary/5">
                                    <h4 className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <Zap size={18} className="animate-pulse" /> Health Insights
                                    </h4>
                                    <ul className="space-y-4">
                                        {healthTips.map((tip, i) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-3 leading-relaxed group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_5px_#10b981]" />
                                                <span className="italic">"{tip}"</span>
                                            </li>
                                        ))}
                                        {healthTips.length === 0 && <li className="text-slate-500 italic text-sm text-center py-4">Generating personalized tips...</li>}
                                    </ul>
                                </div>
                                <div className="card-glass p-8 text-center border-blue-500/20 bg-blue-500/5">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4 border border-blue-500/30">
                                        <Droplets size={32} />
                                    </div>
                                    <h4 className="text-white font-black text-lg mb-2 italic uppercase tracking-tighter">Hydration Goal</h4>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Drink 8 glasses of water today for optimal health and metabolism.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Meal Guide Sections */}
                    {(activeSection === 'all' || activeSection === 'meal-guide' || activeSection === 'breakfast') && (
                        <div id="section-breakfast" className="mb-12">
                            <h3 className="section-heading mb-6">Breakfast Selection</h3>
                            {/* Gym Highlight Banner */}
                            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                                    <Dumbbell size={24} />
                                </div>
                                <div>
                                    <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-1">Fitness Tip</h4>
                                    <p className="text-slate-200 text-sm font-medium">For weight loss / strength training: take <span className="text-amber-400">Sweet Potatoes</span> or <span className="text-amber-400">Bananas</span> as pre-gym fuel!</p>
                                </div>
                            </div>
                            <MealCarousel
                                items={MEAL_GUIDE.breakfast}
                                accentColor="#34d399"
                                favorites={favorites}
                                handleToggleFavorite={handleToggleFavorite}
                                showLogButton={true}
                                handleLogMeal={handleLogMeal}
                                loggingMeal={loggingMeal}
                                type="breakfast"
                            />
                        </div>
                    )}

                    {(activeSection === 'all' || activeSection === 'meal-guide' || activeSection === 'lunch') && (
                        <div id="section-lunch" className="mb-12">
                            <h3 className="section-heading mb-6">Lunch Selection</h3>
                            <MealCarousel
                                items={MEAL_GUIDE.lunch}
                                accentColor="#38bdf8"
                                favorites={favorites}
                                handleToggleFavorite={handleToggleFavorite}
                                showLogButton={true}
                                handleLogMeal={handleLogMeal}
                                loggingMeal={loggingMeal}
                                type="lunch"
                            />
                        </div>
                    )}

                    {(activeSection === 'all' || activeSection === 'meal-guide' || activeSection === 'dinner') && (
                        <div id="section-dinner" className="mb-12">
                            <h3 className="section-heading mb-6">Dinner Selection</h3>
                            <div className="mb-4 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center">Vegetarian Options</div>
                            <div className="mb-8">
                                <MealCarousel
                                    items={MEAL_GUIDE.dinner.veg}
                                    accentColor="#10b981"
                                    favorites={favorites}
                                    handleToggleFavorite={handleToggleFavorite}
                                    showLogButton={true}
                                    handleLogMeal={handleLogMeal}
                                    loggingMeal={loggingMeal}
                                    type="dinner"
                                />
                            </div>
                            <div className="mb-4 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center">Non-Vegetarian Options</div>
                            <MealCarousel
                                items={MEAL_GUIDE.dinner.nonveg}
                                accentColor="#f59e0b"
                                favorites={favorites}
                                handleToggleFavorite={handleToggleFavorite}
                                showLogButton={true}
                                handleLogMeal={handleLogMeal}
                                loggingMeal={loggingMeal}
                                type="dinner"
                            />
                        </div>
                    )}

                    {(activeSection === 'all' || activeSection === 'meal-guide' || activeSection === 'snacks') && (
                        <div id="section-snacks" className="mb-12">
                            <h3 className="section-heading mb-6">Light Snacks</h3>
                            <MealCarousel
                                items={MEAL_GUIDE.snack}
                                accentColor="#a78bfa"
                                favorites={favorites}
                                handleToggleFavorite={handleToggleFavorite}
                                showLogButton={true}
                                handleLogMeal={handleLogMeal}
                                loggingMeal={loggingMeal}
                                type="snack"
                            />
                        </div>
                    )}

                    {(activeSection === 'all' || activeSection === 'workout') && (
                        <div id="section-workout" className="mb-12 pt-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-white italic tracking-tighter">WORKOUT CENTER</h3>
                                <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">Training Mode Active</div>
                            </div>

                            {/* Daily Cardio Banner */}
                            <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-red-600/10 to-transparent border border-red-600/20 flex flex-wrap items-center justify-between gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -mr-16 -mt-16" />
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500">
                                        <Wind size={30} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tighter italic">Morning Cardio</h4>
                                        <p className="text-slate-400 text-sm font-medium italic">"30 minutes of cardio before every workout to maximize fat burn."</p>
                                    </div>
                                </div>
                                <div className="px-6 py-2 bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest">Mandatory</div>
                            </div>

                            <div className="space-y-12">
                                {Object.entries(WORKOUT_GUIDE).map(([id, group]) => (
                                    <div key={id}>
                                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                            <div className="w-2 h-8 rounded-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ backgroundColor: group.color }} />
                                            <h4 className="text-lg font-black text-white uppercase tracking-[0.2em] italic">{group.label}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {group.exercises.map(ex => (
                                                <WorkoutCard key={ex.name} exercise={ex} accentColor={group.color} glow={group.glow} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Nutrition Insight */}
                    {mealPlan?.ai_insight && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card-glass p-8 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 mb-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-primary/20 rounded-xl text-primary animate-pulse">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.3em]">AI Nutrition Insight</h3>
                            </div>
                            <p className="text-base text-slate-200 leading-relaxed font-medium italic">
                                "{mealPlan.ai_insight}"
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Custom Reset Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                            onClick={() => setShowResetModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative z-[101] shadow-2xl shadow-primary/20 text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3 italic tracking-tighter">RESET DAILY PROGRESS?</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                This will clear all logged meals for today. This action cannot be undone. Are you sure you want to start fresh?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleResetMacros}
                                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-600/20"
                                >
                                    Yes, Reset Everything
                                </button>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                                >
                                    Keep My Progress
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AIChatBot />
        </div>
    );
}
