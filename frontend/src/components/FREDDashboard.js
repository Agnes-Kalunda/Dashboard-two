import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Container, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Paper, 
  Typography 
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FREDDashboard = () => {
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get('/api/fred-data/');
        setSeries(response.data.series);
        if (response.data.series.length > 0) {
          setSelectedSeries(response.data.series[0].id);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    };

    fetchSeries();
  }, []);

  useEffect(() => {
    const fetchSeriesData = async () => {
      if (!selectedSeries) return;

      try {
        const response = await axios.get(`/api/series-data/${selectedSeries}/`);
        setSeriesData(response.data.observations);
      } catch (error) {
        console.error('Error fetching series data:', error);
      }
    };

    fetchSeriesData();
    const intervalId = setInterval(fetchSeriesData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedSeries]);

  const handleSeriesChange = (event) => {
    setSelectedSeries(event.target.value);
  };

  const chartData = {
    labels: seriesData.map(item => item.date),
    datasets: [
      {
        label: 'FRED Data',
        data: seriesData.map(item => parseFloat(item.value)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const pieData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: [
          seriesData.filter(item => parseFloat(item.value) > 0).length,
          seriesData.filter(item => parseFloat(item.value) <= 0).length,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        FRED Data Dashboard
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="series-select-label">Select Series</InputLabel>
        <Select
          labelId="series-select-label"
          id="series-select"
          value={selectedSeries}
          label="Select Series"
          onChange={handleSeriesChange}
        >
          {series.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Line Chart
            </Typography>
            <Line data={chartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Bar Chart
            </Typography>
            <Bar data={chartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Pie Chart (Positive vs Negative Values)
            </Typography>
            <Pie data={pieData} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FREDDashboard;