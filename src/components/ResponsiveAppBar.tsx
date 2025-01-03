import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router';
import { AppBar } from '@mui/material';

const PATHS = [
  {
    path: '/',
    name: '분류'
  },
  {
    path: '/supervised',
    name: '2D 데이터 학습'
  },
  {
    path: '/cnn/image',
    name: '손글씨 학습'
  }
]

export default function ResponsiveAppBar() {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {PATHS.map((pathInfo) => (
              <MenuItem key={pathInfo.path} onClick={() => handleMenuClick(pathInfo.path)}>
                <Typography sx={{ textAlign: 'center' }}>{pathInfo.name}</Typography>
              </MenuItem>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
