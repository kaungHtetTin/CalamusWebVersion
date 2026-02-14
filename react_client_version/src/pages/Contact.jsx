import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ContactSupport as ContactSupportIcon,
} from '@mui/icons-material';

const SOCIAL_LINKS = [
  { label: 'Facebook (Easy English)', href: 'https://www.facebook.com/easyenglishcalamus' },
  { label: 'Facebook (Easy Korean)', href: 'https://www.facebook.com/easykoreancalamus' },
  { label: 'Telegram', href: 'https://t.me/calamuseducation_myanmar' },
  { label: 'YouTube', href: 'https://www.youtube.com/@calamuseducationmyanmar5078' },
];

const Contact = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Home
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={600}>Contact Us</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: '1.5rem' }}>
          Contact Us
        </Typography>

        <Grid container spacing={4}>
          {/* Left: visual / message */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                minHeight: 280,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <ContactSupportIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Get in touch
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Have questions about our courses or need support? Reach us by email, phone, or through our social channels. We&apos;re here to help.
              </Typography>
            </Paper>
          </Grid>

          {/* Right: contact info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                Contact Information
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <EmailIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 0.5 }}>
                        Email Address
                      </Typography>
                      <Link href="mailto:contact@calamuseducation.com" underline="hover" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        contact@calamuseducation.com
                      </Link>
                      <Link href="mailto:calamuseducation@gmail.com" underline="hover" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        calamuseducation@gmail.com
                      </Link>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <PhoneIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 0.5 }}>
                        Phone Number
                      </Typography>
                      <Link href="tel:09682537158" underline="hover" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        09682537158
                      </Link>
                      <Link href="tel:09693897575" underline="hover" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        09693897575
                      </Link>
                      <Link href="tel:09795366898" underline="hover" sx={{ display: 'block', fontSize: '0.875rem' }}>
                        09795366898
                      </Link>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 1.5 }}>
                    Follow us
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {SOCIAL_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
