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
  useTheme,
  alpha,
} from '@mui/material';
import { Home as HomeIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

const SECTIONS = [
  { id: 'account', title: '1. Account' },
  { id: 'content-enroll', title: '2. Content Enrollment and Lifetime Access' },
  { id: 'payments', title: '3. Payments' },
  { id: 'content-rule', title: '4. Content and Behavior Rules' },
  { id: 'content-right', title: "5. Calamus's Rights to Content You Post" },
  { id: 'own-risk', title: '6. Using Calamus at Your Own Risk' },
  { id: 'calamus-right', title: "7. Calamus's Rights" },
  { id: 'contact', title: '8. How to Contact Us' },
];

const Terms = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<ChevronRightIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Home
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={600}>Terms of Use</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: '1.5rem' }}>
          Terms of Use
        </Typography>

        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: { md: 'sticky' }, top: 24 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</Typography>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ display: 'block', py: 0.75, color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}>
                Terms of Use
              </Link>
              <Link component={RouterLink} to="/privacy" underline="hover" sx={{ display: 'block', py: 0.75, color: 'text.secondary', fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
            </Paper>
          </Grid>

          {/* Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ '& h2': { fontSize: '1.1rem', fontWeight: 700, mt: 3, mb: 1.5 }, '& h3': { fontSize: '1rem', fontWeight: 700, mt: 2.5, mb: 1 }, '& p': { fontSize: '0.875rem', lineHeight: 1.75, mb: 1.5 }, '& ul': { pl: 2.5, mb: 2 }, '& li': { fontSize: '0.875rem', mb: 0.5 } }}>
              <Typography component="p" sx={{ fontStyle: 'italic', fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
                These Terms of Use (&quot;Terms&quot;) were last updated on Feb. 8, 2023.
              </Typography>
              <Typography>
                Mission of Calamus Education is to support the higher education of Myanmar. We create online education contents and support to be more convenient for taking the online courses. We need rules to keep our platform and services safe for you, us, and our student and instructor community. These Terms apply to all your activities on the Calamus Education website, the Calamus&apos;s mobile applications, and other related services (<strong>&quot;Services&quot;</strong>).
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Table of Contents</Typography>
              <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <Link href={`#${s.id}`} underline="hover" sx={{ fontSize: '0.8125rem' }}>{s.title}</Link>
                  </li>
                ))}
              </Box>

              <Box id="account" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">1. Accounts</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  You need an account for most activities on our platform. Keep your password somewhere safe, because you&apos;re responsible for all activity associated with your account. If you suspect someone else is using your account, let us know by contacting our Support Team. You must have reached the age of consent for online services in your country to use Calamus.
                </Paper>
                <Typography>
                  You need an account for most activities on our platform, including to purchase and access content or to submit content for publication. When setting up and maintaining your account, you must provide and continue to provide accurate and complete information, including a valid email address. You have complete responsibility for your account and everything that happens on your account, including for any harm or damage (to us or anyone else) caused by someone using your account without your permission. This means you need to be careful with your password. You may not transfer your account to someone else or use someone else&apos;s account. If you contact us to request access to an account, we will not grant you such access unless you can provide us with the information that we need to prove you are the owner of that account. In the event of the death of a user, the account of that user will be closed.
                </Typography>
              </Box>

              <Box id="content-enroll" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">2. Content Enrollment and Lifetime Access</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  When you enroll in a course or other content, you get a license from us to view it via the Calamus Services and no other use. Don&apos;t try to transfer or resell content in any way. We generally grant you a lifetime access license, except when we must disable the content because of legal or policy reasons or for enrollments via Subscription Plans.
                </Paper>
              </Box>

              <Box id="payments" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">3. Payments</Typography>
                <Typography>
                  When you make a payment, you agree to use a valid payment method. We receive the payments from mobile banking in Myanmar such as KBZ Pay, Wave Pay and Mytel Pay. So we do not save any payment method of the students.
                </Typography>
              </Box>

              <Box id="content-rule" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">4. Content and Behavior Rules</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  You can only use Calamus for lawful purposes. You&apos;re responsible for all the content that you post on our platform. You should keep the reviews, questions, posts, courses and other content you upload in line with our Trust &amp; Safety Guidelines and the law, and respect the intellectual property rights of others. We can ban your account for repeated or major offenses. If you think someone is infringing your copyright on our platform, let us know.
                </Paper>
                <Typography>
                  You may not access or use the Services or create an account for unlawful purposes. Your use of the Services and behavior on our platform must comply with applicable local or national laws or regulations of your country. You are solely responsible for the knowledge of and compliance with such laws and regulations that are applicable to you.
                </Typography>
                <Typography>
                  If you are a student, the Services enable you to ask questions to the instructors of courses or other content you are enrolled in, and to post reviews of content. For certain content, the instructor may invite you to submit content as &quot;homework&quot; or tests. Don&apos;t post or submit anything that is not yours.
                </Typography>
              </Box>

              <Box id="content-right" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">5. Calamus&apos;s Rights to Content You Post</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  You retain ownership of content you post to our platform. We&apos;re allowed to share your content to anyone through any media, including promoting it via advertising on other websites.
                </Paper>
                <Typography>
                  The content you post as a student remains yours. By posting content, you allow Calamus to reuse and share it but you do not lose any ownership rights you may have over your content.
                </Typography>
                <Typography>
                  When you post content, comments, questions, reviews, and when you submit to us ideas and suggestions for new features or improvements, you authorize Calamus to use and share this content with anyone, distribute it and promote it on any platform and in any media, and to make modifications or edits to it as we see fit.
                </Typography>
              </Box>

              <Box id="own-risk" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">6. Using Calamus at Your Own Risk</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  Anyone can use Calamus to create and publish content and instructors and we enable instructors and students to interact for teaching and learning. Like other platforms where people can post content and interact, some things can go wrong, and you use Calamus at your own risk.
                </Paper>
                <Typography>
                  Our platform model means we do not review or edit the content for legal issues, and we are not in a position to determine the legality of content. We do not exercise any editorial control over the content that is available on the platform and, as such, do not guarantee in any manner the reliability, validity, accuracy, or truthfulness of the content. If you access content, you rely on any information provided by an instructor at your own risk.
                </Typography>
                <Typography>
                  By using the Services, you may be exposed to content that you consider offensive, indecent, or objectionable. Calamus has no responsibility to keep such content from you and no liability for your access or enrollment in any course or other content, to the extent permissible under applicable law. This also applies to any content relating to health, wellness, and physical exercise. You acknowledge the inherent risks and dangers in the strenuous nature of these types of content, and by accessing such content you choose to assume those risks voluntarily, including risk of illness, bodily injury, disability, or death. You assume full responsibility for the choices you make before, during, and after your access to the content.
                </Typography>
                <Typography>
                  When you interact directly with a student or an instructor, you must be careful about the types of personal information that you share. While we restrict the types of information instructors may request from students, we do not control what students and instructors do with the information they obtain from other users on the platform. You should not share your email or other personal information about you for your safety.
                </Typography>
              </Box>

              <Box id="calamus-right" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">7. Calamus&apos;s Rights</Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  We own the Calamus Education platform and Services, including the website, present or future apps and services, and things like our logos, API, code, and content created by our employees. You can&apos;t tamper with those or use them without authorization.
                </Paper>
                <Typography>
                  All right, title, and interest in and to the Calamus platform and Services, including our website, our existing or future applications, our APIs, databases, and the content our employees or partners submit or provide through our Services (but excluding content provided by instructors and students) are and will remain the exclusive property of Calamus and its licensors. Our platforms and services are protected by copyright, trademark, and other laws of both Myanmar and foreign countries. Nothing gives you a right to use the Calamus name or any of the Calamus trademarks, logos, domain names, and other distinctive brand features. Any feedback, comments, or suggestions you may provide regarding Calamus or the Services is entirely voluntary and we will be free to use such feedback, comments, or suggestions as we see fit and without any obligation to you.
                </Typography>
              </Box>

              <Box id="contact" sx={{ scrollMarginTop: 24 }}>
                <Typography component="h3">8. How to contact us</Typography>
                <Typography>
                  The best way to get in touch with us is to contact our phone number, 09693897575, 09682537158, and 09979638684. We&apos;d love to hear your questions, concerns, and feedback about our Services.
                  <br />
                  Thanks for learning with us!
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Terms;
