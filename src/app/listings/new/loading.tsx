import { Container, Paper, Skeleton, Stack } from "@mui/material";

export default function NewListingLoading() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={0} sx={{ border: "1px solid rgba(11, 110, 153, 0.12)", p: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="text" width="70%" height={64} />
          <Skeleton variant="text" width="100%" height={56} />
          <Skeleton variant="rounded" width="100%" height={72} />
          <Skeleton variant="rounded" width="100%" height={72} />
          <Skeleton variant="rounded" width="100%" height={140} />
          <Skeleton variant="rounded" width="100%" height={72} />
        </Stack>
      </Paper>
    </Container>
  );
}
