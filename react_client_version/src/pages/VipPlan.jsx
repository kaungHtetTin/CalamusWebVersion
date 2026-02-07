import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  Verified as BlueMarkIcon,
  EmojiEvents as TrophyIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  Payment as PaymentIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  CardGiftcard as GiftIcon,
  School as SchoolIcon,
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
  PhoneAndroid as PhoneIcon,
  ViewList as AllIcon,
} from '@mui/icons-material';
import { vipPlanAPI } from '../services/api';

// Tier icon & color
const tierConfig = {
  diamond: { icon: <DiamondIcon />, color: '#00838f', bg: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)' },
  gold: { icon: <TrophyIcon />, color: '#f57f17', bg: 'linear-gradient(135deg, #fff8e1, #ffe082)' },
  silver: { icon: <PremiumIcon />, color: '#616161', bg: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' },
};

// Bundle Plan Card
const BundlePlanCard = ({ plan, isPopular }) => {
  const theme = useTheme();
  const tier = tierConfig[plan.tier] || tierConfig.silver;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isPopular
          ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.15)}`
          : '0 1px 8px rgba(0,0,0,0.06)',
        border: isPopular ? `2px solid ${theme.palette.primary.main}` : '1px solid',
        borderColor: isPopular ? 'primary.main' : 'divider',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
        },
      }}
    >
      {isPopular && (
        <Box sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 0.5, fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1 }}>
          BEST VALUE
        </Box>
      )}

      <Box sx={{ background: tier.bg, p: 2.5, textAlign: 'center' }}>
        <Avatar sx={{ width: 44, height: 44, mx: 'auto', mb: 1, bgcolor: alpha('#000', 0.06), color: tier.color }}>
          {tier.icon}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={700}>{plan.name}</Typography>
        <Typography variant="caption" color="text.secondary">{plan.remark}</Typography>
      </Box>

      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} color="primary.main">{plan.priceLabel}</Typography>
        {plan.savings && (
          <Chip icon={<GiftIcon sx={{ fontSize: 14 }} />} label={plan.savings} size="small" color="success" variant="outlined" sx={{ mt: 1, fontSize: '0.7rem' }} />
        )}

        <Stack spacing={0.75} sx={{ mt: 2, textAlign: 'left' }}>
          {[
            { icon: <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />, text: 'All included courses' },
            plan.blueMark && { icon: <BlueMarkIcon sx={{ fontSize: 16, color: 'info.main' }} />, text: 'Blue Mark verification' },
            { icon: <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Additional lessons & features' },
            { icon: <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />, text: 'Lifetime access' },
          ].filter(Boolean).map((item, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
              {item.icon}
              <Typography variant="body2" fontSize="0.8rem">{item.text}</Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          variant={isPopular ? 'contained' : 'outlined'}
          fullWidth
          size="medium"
          endIcon={<ArrowIcon />}
          sx={{ mt: 2, fontWeight: 600 }}
        >
          Choose Plan
        </Button>
      </Box>
    </Paper>
  );
};

// Course Row
const CourseRow = ({ course, isLast }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.25,
        px: 2,
        borderBottom: isLast ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <SchoolIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
        <Typography variant="body2" fontWeight={500} noWrap>{course.name}</Typography>
        {course.blueMark && <BlueMarkIcon sx={{ fontSize: 14, color: 'info.main', flexShrink: 0 }} />}
        {course.remark && <Chip label={course.remark} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
      </Stack>
      <Chip
        label={course.isFree ? 'Free' : course.priceLabel}
        size="small"
        color={course.isFree ? 'success' : 'default'}
        variant={course.isFree ? 'filled' : 'outlined'}
        sx={{ fontWeight: 600, fontSize: '0.75rem', ml: 1 }}
      />
    </Box>
  );
};

// Payment Method Card
const PaymentMethodCard = ({ method, onCopy, copied }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { borderColor: 'primary.main', boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.1)}` },
        transition: 'all 0.2s',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
          <PaymentIcon fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>{method.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{method.phone} · {method.accountName}</Typography>
          </Stack>
        </Box>
        <Button
          size="small"
          variant="text"
          startIcon={copied === method.phone ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          color={copied === method.phone ? 'success' : 'primary'}
          onClick={() => onCopy(method.phone)}
          sx={{ fontSize: '0.7rem', minWidth: 70 }}
        >
          {copied === method.phone ? 'Copied' : 'Copy'}
        </Button>
      </Stack>
    </Paper>
  );
};

// Language Section (used in "All" view and single-language view)
const LanguageSection = ({ language, showLabel }) => {
  const theme = useTheme();

  return (
    <Box>
      {showLabel && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography fontSize="1.3rem">{language.icon}</Typography>
          <Typography variant="h6" fontWeight={700}>{language.name}</Typography>
        </Stack>
      )}

      {/* Bundle Plans */}
      {language.bundlePlans?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {!showLabel && (
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Bundle Plans
            </Typography>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: language.bundlePlans.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                md: language.bundlePlans.length <= 3
                  ? `repeat(${language.bundlePlans.length}, 1fr)`
                  : 'repeat(3, 1fr)',
              },
              gap: 2.5,
              maxWidth: language.bundlePlans.length === 1 ? 360 : '100%',
            }}
          >
            {language.bundlePlans.map((plan, i) => (
              <BundlePlanCard
                key={i}
                plan={plan}
                isPopular={language.bundlePlans.length === 1 || i === language.bundlePlans.length - 1}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Individual Courses */}
      <Box sx={{ mb: showLabel ? 2 : 4 }}>
        {!showLabel && (
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Individual Courses
          </Typography>
        )}
        <Paper
          elevation={0}
          sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              px: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Course
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Price
            </Typography>
          </Box>
          {language.courses.map((course, i) => (
            <CourseRow key={i} course={course} isLast={i === language.courses.length - 1} />
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

// Skeleton
const VipPlanSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
    <Skeleton variant="text" width={200} height={36} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width={320} height={20} sx={{ mb: 3 }} />
    <Skeleton variant="rounded" height={48} sx={{ mb: 4 }} />
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={320} sx={{ flex: 1 }} />
      ))}
    </Stack>
    <Skeleton variant="rounded" height={250} />
  </Container>
);

const VipPlan = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = English, 2 = Korean
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await vipPlanAPI.get();
        setData(response.data);
      } catch (err) {
        setError('Failed to load VIP plan data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(phone);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // Build tab list: All + each language
  const tabs = useMemo(() => {
    if (!data) return [];
    return [
      { id: 'all', label: 'All', icon: '📋' },
      ...data.languages.map((lang) => ({ id: lang.id, label: lang.name, icon: lang.icon })),
    ];
  }, [data]);

  if (loading) return <VipPlanSkeleton />;

  if (error || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h6" color="error">{error || 'Something went wrong'}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Try Again</Button>
      </Box>
    );
  }

  const isAll = activeTab === 0;
  const activeLanguage = !isAll ? data.languages[activeTab - 1] : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>

        {/* Page Header - Simple & Clean */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <PremiumIcon sx={{ color: '#ffc107', fontSize: 22 }} />
            <Typography variant="h6" fontWeight={700}>
              VIP Plans & Pricing
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            VIP User အဖြစ် မိမိကြိုက်နှစ်သက်ရာ Plan ကို ရွေးချယ်ပြီး မှတ်ပုံတင်နိုင်ပါသည်။
          </Typography>
        </Box>

        {/* Tab Filter */}
        <Box sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': {
                height: 2.5,
                borderRadius: '2px 2px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: 40,
                py: 1,
                px: 2.5,
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography component="span" fontSize="1rem">{tab.icon}</Typography>
                    <span>{tab.label}</span>
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        {isAll ? (
          // ALL tab: show each language in sequence
          <Box>
            {data.languages.map((lang, idx) => (
              <Box key={lang.id}>
                <LanguageSection language={lang} showLabel />
                {idx < data.languages.length - 1 && <Divider sx={{ my: 4 }} />}
              </Box>
            ))}
          </Box>
        ) : (
          // Single language tab
          <LanguageSection language={activeLanguage} showLabel={false} />
        )}

        {/* Info Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4, mt: 2 }}>
          <Paper
            elevation={0}
            sx={{ flex: 1, p: 2.5, border: '1px solid', borderColor: 'divider', borderLeft: `3px solid ${theme.palette.info.main}` }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <BlueMarkIcon sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700}>{data.blueMarkInfo.title}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.8rem' }}>
              {data.blueMarkInfo.description}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{ flex: 1, p: 2.5, border: '1px solid', borderColor: 'divider', borderLeft: `3px solid ${theme.palette.success.main}` }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <DiamondIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700}>{data.diamondPlanInfo.title}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.8rem', mb: 0.5 }}>
              {data.diamondPlanInfo.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.8rem', fontStyle: 'italic' }}>
              {data.diamondPlanInfo.example}
            </Typography>
          </Paper>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Payment Methods */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.25 }}>
            ငွေပေးချေနိုင်သည့်နည်းလမ်းများ
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Payment Methods
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {data.paymentMethods.map((method, i) => (
              <PaymentMethodCard key={i} method={method} onCopy={handleCopy} copied={copied} />
            ))}
          </Box>
        </Box>

        {/* Payment Instructions */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: `3px solid ${theme.palette.warning.main}`,
            bgcolor: alpha(theme.palette.warning.main, 0.03),
            mb: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <InfoIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700}>{data.paymentInstructions.title}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.8rem' }}>
            {data.paymentInstructions.description}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default VipPlan;
