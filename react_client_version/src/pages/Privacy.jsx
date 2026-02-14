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
} from '@mui/material';
import { Home as HomeIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

const SECTIONS = [
  { id: 'information-we-collect', title: '1. Information We Collect' },
  { id: 'how-we-use', title: '2. How We Use Your Information' },
  { id: 'third-party', title: '3. Third-Party Services' },
  { id: 'data-sharing', title: '4. Data Sharing and Disclosure' },
  { id: 'data-security', title: '5. Data Security' },
  { id: 'your-rights', title: '6. Your Rights' },
  { id: 'changes', title: '7. Changes to This Privacy Policy' },
  { id: 'contact', title: '8. Contact Us' },
];

const Privacy = () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Home
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={600}>Privacy Policy</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: '1.5rem' }}>
          Privacy Policy
        </Typography>

        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: { md: 'sticky' }, top: 24 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</Typography>
              <Link component={RouterLink} to="/terms" underline="hover" sx={{ display: 'block', py: 0.75, color: 'text.secondary', fontSize: '0.875rem' }}>
                Terms of Use
              </Link>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ display: 'block', py: 0.75, color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
            </Paper>
          </Grid>

          {/* Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ '& h2': { fontSize: '1.1rem', fontWeight: 700, mt: 3, mb: 1.5 }, '& h3': { fontSize: '1rem', fontWeight: 700, mt: 2.5, mb: 1 }, '& p': { fontSize: '0.875rem', lineHeight: 1.75, mb: 1.5 }, '& ul': { pl: 2.5, mb: 2 }, '& li': { fontSize: '0.875rem', mb: 0.5 } }}>
              <Typography component="h2" sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 1 }}>
                Privacy Policy for Apps by Calamus Education
              </Typography>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                Effective Date: Sept 7, 2025
              </Typography>
              <Typography>
                This Privacy Policy applies to all mobile applications developed by <strong>Calamus Education</strong>, including but not limited to:
              </Typography>
              <Box component="ul" sx={{ mb: 2 }}>
                <li><strong>Easy Korean - Korean for Myanmar</strong></li>
                <li><strong>Easy English - English for Myanmar</strong></li>
              </Box>
              <Typography>
                These apps (&quot;the Apps&quot;) are developed by <strong>Moe Kaung</strong> under <strong>Calamus Education</strong>. We respect your privacy and are committed to protecting the information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use any of our Apps.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Table of Contents</Typography>
              <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <Link href={`#${s.id}`} underline="hover" sx={{ fontSize: '0.8125rem' }}>{s.title}</Link>
                  </li>
                ))}
              </Box>

              <Box id="information-we-collect" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">1. Information We Collect</Typography>
                <Box component="ul">
                  <li><strong>Personal Information:</strong> Such as name or email address if you voluntarily provide it for feedback or support.</li>
                  <li><strong>Device Information:</strong> Such as device type, operating system, and unique device identifiers for app functionality and analytics.</li>
                  <li><strong>Usage Data:</strong> Such as pages viewed, time spent in the app, and interactions to improve app performance.</li>
                </Box>
              </Box>

              <Box id="how-we-use" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">2. How We Use Your Information</Typography>
                <Box component="ul">
                  <li>To provide and maintain the Apps&apos; functionality.</li>
                  <li>To improve user experience and app performance.</li>
                  <li>To respond to support requests and user feedback.</li>
                  <li>To analyze app usage for development and improvement purposes.</li>
                  <li>To comply with legal requirements if applicable.</li>
                </Box>
              </Box>

              <Box id="third-party" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">3. Third-Party Services</Typography>
                <Typography>
                  We may use trusted third-party services that help us operate the Apps, such as analytics or advertising providers. These third parties may collect information as described in their own privacy policies. Examples include:
                </Typography>
                <Box component="ul">
                  <li>Google Analytics (for usage analytics)</li>
                  <li>AdMob (for advertising, if used)</li>
                </Box>
                <Typography>
                  You can review their privacy policies here: <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" underline="hover">Google Privacy Policy</Link>
                </Typography>
              </Box>

              <Box id="data-sharing" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">4. Data Sharing and Disclosure</Typography>
                <Typography>
                  We do not sell or rent your personal information. We may share data only in the following circumstances:
                </Typography>
                <Box component="ul">
                  <li>With service providers who help us deliver our Apps.</li>
                  <li>To comply with legal obligations or protect rights and safety.</li>
                </Box>
              </Box>

              <Box id="data-security" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">5. Data Security</Typography>
                <Typography>
                  We use appropriate technical and organizational measures to protect your data. However, no system can be 100% secure, so we cannot guarantee absolute security.
                </Typography>
              </Box>

              <Box id="your-rights" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">6. Your Rights</Typography>
                <Typography>You have the right to:</Typography>
                <Box component="ul">
                  <li>Access, update, or delete your personal information.</li>
                  <li>Request more details on how we handle your data.</li>
                  <li>Withdraw your consent where applicable.</li>
                </Box>
                <Typography>
                  You can contact us at <strong>shweyamin3454691@gmail.com</strong> for any privacy-related inquiries.
                </Typography>
              </Box>

              <Box id="changes" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">7. Changes to This Privacy Policy</Typography>
                <Typography>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated effective date.
                </Typography>
              </Box>

              <Box id="contact" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">8. Contact Us</Typography>
                <Typography>
                  If you have questions about this Privacy Policy or our practices, please contact us at:
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Calamus Education</strong><br />
                  Email: <strong>shweyamin3454691@gmail.com</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
);

export default Privacy;
