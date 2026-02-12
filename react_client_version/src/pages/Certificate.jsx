import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { courseAPI } from '../services/api';

// Certificate design matching the old PHP generate_certificate.php layout
const certificateFont = '"Rosario", "Poppins", sans-serif';

function formatIssuedDate(dateStr) {
  const d = new Date(dateStr);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  let day = d.getDate();
  if (day % 10 === 1 && day !== 11) day += 'st';
  else if (day % 10 === 2 && day !== 12) day += 'nd';
  else if (day % 10 === 3 && day !== 13) day += 'rd';
  else day += 'th';
  return `${month} ${day}, ${year}`;
}

// Use assets from React public folder (copy from old PHP app's assets/images/)
const getAssetPath = (filename) => {
  const base = process.env.PUBLIC_URL || '';
  return `${base}/assets/images/${filename}`;
};

const Certificate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const courseId = searchParams.get('course_id');

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [bgImageError, setBgImageError] = useState(false);
  const captureRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.phone) {
      setError('Please log in to view your certificate.');
      setLoading(false);
      return;
    }
    if (!courseId) {
      setError('No course specified. Use the "Get Certificate" button from a completed course.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchCert = async () => {
      try {
        const response = await courseAPI.getCertificate(courseId, user.phone);
        if (cancelled) return;
        if (response.success) {
          setData(response.data);
          setError(null);
          setBgImageError(false);
        } else {
          setError(response.error || 'Failed to load certificate.');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err.response?.data?.error || err.message || 'Failed to load certificate.';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCert();
    return () => { cancelled = true; };
  }, [courseId, isAuthenticated, user?.phone]);

  const handleDownload = async () => {
    const el = captureRef.current;
    if (!el || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `calamus-certificate-${data.encodedId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // Always use local assets from React public folder so images load (same-origin, no API host dependency)
  const certificateBg = bgImageError ? getAssetPath('ee_certificate_bg.png') : getAssetPath('certificate_background.png');
  const certificateSeal = getAssetPath(
    data?.major === 'english' ? 'ee_certificate_seal.png' : 'ko_certificate_seal.png'
  );
  const featherIcon = getAssetPath('certificate/feather.svg');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
              color: 'text.secondary',
              fontSize: 16,
              fontFamily: certificateFont,
            }}
          >
            <Box
              component="img"
              src={featherIcon}
              alt=""
              sx={{ width: 100, height: 100, mx: 'auto', display: 'block', mb: 2 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <Typography sx={{ fontFamily: certificateFont, whiteSpace: 'pre-line' }}>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-learning')}
              sx={{ mt: 3, textTransform: 'none' }}
            >
              Go to My Learning
            </Button>
          </Box>
        )}

        {data && !loading && (
          <>
            {/* Same layout as generate_certificate.php: 650x460 captureArea */}
            <Box sx={{ overflow: 'auto', width: '100%' }}>
              <Box
                ref={captureRef}
                sx={{
                  position: 'relative',
                  width: 650,
                  height: 460,
                  margin: '0 auto',
                  overflow: 'visible',
                }}
              >
                <Box
                  component="img"
                  src={certificateBg}
                  alt=""
                  onError={() => setBgImageError(true)}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />

                {/* certificate_of_completion: top 70px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 70,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                    fontWeight: 700,
                    fontSize: 30,
                    letterSpacing: 5,
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </Typography>

                {/* This is to certify that: top 125px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 125,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                  }}
                >
                  This is to certify that
                </Typography>

                {/* Name font_bold 30px: top 160px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 160,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                    fontWeight: 700,
                    fontSize: 30,
                  }}
                >
                  {data.userName}
                </Typography>

                {/* Line under name: top 188px, width 500px, left 75px, height 2px */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 200,
                    left: 75,
                    width: 500,
                    height: 2,
                    bgcolor: 'black',
                    margin: '0 auto',
                  }}
                />

                {/* has completed the: top 203px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 203,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                  }}
                >
                  has completed the
                </Typography>

                {/* Course title font_bold 22px: top 231px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 231,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {data.courseTitle}
                </Typography>

                {/* on the platform: top 263px */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 263,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: certificateFont,
                  }}
                >
                  on the {data.platform} platform by Calamus Education
                </Typography>

                {/* Seal: bottom 45px, right 60px, 110x110 */}
                <Box
                  component="img"
                  src={certificateSeal}
                  alt=""
                  sx={{
                    position: 'absolute',
                    bottom: 45,
                    right: 60,
                    width: 110,
                    height: 110,
                  }}
                />

                {/* Issued on: bottom 36px, right 40px, font 13px, width 170px */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 36,
                    right: 40,
                    width: 170,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontFamily: certificateFont, fontWeight: 700, fontSize: 13 }}>
                    Issued on {formatIssuedDate(data.issuedDate)}
                  </Typography>
                </Box>

                {/* Certificate ID block: bottom 95px, left 28px, font 12px */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 95,
                    left: 38,
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: certificateFont,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 12 }}>
                    Certificate ID : <span style={{ fontFamily: 'monospace' }}>{data.certificateCode}</span>
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    Authorized by <strong>Calamus Education</strong>
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    <strong>Sca</strong>n the <strong>QR</strong> code <strong>bel</strong>ow to <strong>ver</strong>ify this <strong>cer</strong>tificate and <strong>vie</strong>w course <strong>con</strong>tent.
                  </Typography>
                </Box>

                {/* QR: bottom 37px, left 35px, 55x55 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 37,
                    left: 35,
                    width: 55,
                    height: 55,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QRCodeCanvas value={data.qrUrl} size={45} level="M" />
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleDownload}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  py: 1.5,
                  px: 4,
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                {downloading ? 'Preparing...' : 'Download'}
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={() => navigate('/my-learning')} sx={{ textTransform: 'none' }}>
                Back to My Learning
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Certificate;
