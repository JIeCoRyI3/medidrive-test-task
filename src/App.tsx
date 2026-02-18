import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ServiceLogForm } from './components/ServiceLogForm'
import { ServiceLogTable } from './components/ServiceLogTable'

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Service Log Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, auto-save, and manage service logs with persisted drafts.
            </Typography>
          </Box>
          <ServiceLogForm />
          <ServiceLogTable />
        </Stack>
      </Container>
    </>
  )
}

export default App
