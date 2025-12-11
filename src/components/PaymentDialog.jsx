import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRazorpay } from 'react-razorpay';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const StripeCheckoutForm = ({ amount, onClose, onSuccess, customer }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Payment service unavailable.');
      setProcessing(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      onSuccess({
        gateway: 'Stripe',
        amount,
        status: 'requires_capture',
        reference: `mock_stripe_payment_${Date.now()}`,
        customer,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" disabled={!stripe || processing}>
        {processing ? 'Processing…' : `Pay $${amount.toFixed(2)} (Stripe)`}
      </Button>
    </Box>
  );
};

const PaymentDialog = ({ open, onClose, amount, onSuccess }) => {
  const [mode, setMode] = useState('stripe');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  const [Razorpay, isRazorpayLoaded] = useRazorpay();
  const [razorpayError, setRazorpayError] = useState(null);

  useEffect(() => {
    if (mode !== 'razorpay') {
      return;
    }

    setRazorpayOptions({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
      amount: Math.round(amount * 100),
      currency: 'USD',
      name: 'Olive Audio Lab',
      description: 'Session Purchase',
      handler: (response) => {
        onSuccess({
          gateway: 'Razorpay',
          amount,
          status: 'captured',
          reference: response.razorpay_payment_id,
          customer: { name: customerName, email },
        });
        onClose();
      },
      prefill: { name: customerName, email },
      theme: { color: '#A3E635' },
    });
  }, [mode, amount, customerName, email, onSuccess, onClose]);

  const handleRazorpay = () => {
    if (!isRazorpayLoaded) {
      setRazorpayError('Unable to load Razorpay.');
      return;
    }

    try {
      const rzpay = new Razorpay(razorpayOptions);
      rzpay.open();
    } catch (error) {
      setRazorpayError(error?.message || 'Unknown Razorpay error');
    }
  };

  const disabled = !customerName || !email;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete payment</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <FormControl>
            <InputLabel id="payment-mode-label">Payment gateway</InputLabel>
            <Select
              labelId="payment-mode-label"
              label="Payment gateway"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="razorpay">Razorpay</MenuItem>
            </Select>
          </FormControl>

          <Divider>
            <Typography variant="caption">Amount due</Typography>
          </Divider>
          <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700 }}>
            ${amount.toFixed(2)}
          </Typography>

          {mode === 'razorpay' && razorpayError && <Alert severity="error">{razorpayError}</Alert>}
          {mode === 'stripe' && !stripePromise && (
            <Alert severity="warning">
              Stripe publishable key missing. Set VITE_STRIPE_PUBLISHABLE_KEY to test payments.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'stripe' && stripePromise && (
          <Box sx={{ flexGrow: 1 }}>
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                amount={amount}
                onClose={onClose}
                onSuccess={onSuccess}
                customer={{ name: customerName, email }}
              />
            </Elements>
          </Box>
        )}
        {mode === 'stripe' && !stripePromise && (
          <Button variant="contained" disabled>
            Configure Stripe
          </Button>
        )}
        {mode === 'razorpay' && (
          <Button
            variant="contained"
            disabled={disabled || !razorpayOptions}
            onClick={handleRazorpay}
          >
            Pay with Razorpay
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
