import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import numeral from 'numeral';
import { FinancialTableRow, MultiyearData } from '../types';
import { bankingColors } from '../theme/theme';

// Styled components for financial tables
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& .MuiTable-root': {
    minWidth: 650,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  '& .MuiTableCell-root': {
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${theme.palette.divider}`,
    padding: '16px 12px',
  },
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 600,
  backgroundColor: '#f8f9fa',
  color: theme.palette.primary.main,
}));

const LabelCell = styled(TableCell)(() => ({
  textAlign: 'left',
  fontWeight: 500,
  fontSize: '0.9rem',
  maxWidth: '200px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const NumberCell = styled(TableCell)(() => ({
  textAlign: 'right',
  fontFamily: '"Roboto Mono", monospace',
  fontVariantNumeric: 'tabular-nums',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '12px 16px',
  minWidth: '120px',
}));

const PercentageCell = styled(NumberCell)(() => ({
  fontSize: '0.875rem',
  fontWeight: 500,
}));

interface FinancialTableProps {
  title: string;
  data: MultiyearData;
  fields: Array<{
    key: string;
    label: string;
    format: 'currency' | 'percentage' | 'number' | 'spacer';
  }>;
  showEvolution?: boolean;
}

// Format currency with French locale
const formatCurrency = (value: number): string => {
  return numeral(value).format('0,0');
};

// Format percentage
const formatPercentage = (value: number): string => {
  return numeral(value / 100).format('0.0%');
};

// Format number
const formatNumber = (value: number): string => {
  return numeral(value).format('0,0.0');
};

// Calculate evolution percentage
const calculateEvolution = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Get evolution color
const getEvolutionColor = (evolution: number): string => {
  if (evolution > 5) return bankingColors.positive;
  if (evolution < -5) return bankingColors.negative;
  return bankingColors.neutral;
};

export const FinancialTable: React.FC<FinancialTableProps> = ({
  title,
  data,
  fields,
  showEvolution = false,
}) => {
  // Sort years chronologically
  const sortedYears = Object.entries(data)
    .map(([key, value]) => ({ key, year: value.year, data: value }))
    .sort((a, b) => a.year - b.year);

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <HeaderCell>Indicateur</HeaderCell>
              {sortedYears.map(({ year }) => (
                <HeaderCell key={year}>{year}</HeaderCell>
              ))}
              {showEvolution && sortedYears.length > 1 && (
                <HeaderCell>Évolution</HeaderCell>
              )}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {fields.map((field) => {
              // Handle spacer rows
              if (field.format === 'spacer') {
                return (
                  <TableRow key={field.key}>
                    <TableCell colSpan={sortedYears.length + 1 + (showEvolution && sortedYears.length > 1 ? 1 : 0)} 
                               sx={{ height: '16px', border: 'none', padding: 0 }} />
                  </TableRow>
                );
              }

              const values = sortedYears.map(({ data }) => {
                const value = data.data[field.key] || data.ratios?.[field.key] || 0;
                // Debug specific fields that are showing as empty
                if (['tresorerie_debut_periode', 'flux_tresorerie_activites_operationnelles', 
                     'flux_tresorerie_activites_investissement', 'flux_tresorerie_activites_financement',
                     'tresorerie_fin_periode', 'total_charges_exploitation'].includes(field.key)) {
                  console.log(`FinancialTable - Field ${field.key} for year ${data.year}: ${value}`);
                  console.log(`FinancialTable - Raw data for year ${data.year}:`, data.data);
                }
                return value;
              });
              
              const evolution = values.length > 1 
                ? calculateEvolution(Number(values[values.length - 1]), Number(values[values.length - 2]))
                : 0;

              return (
                <TableRow key={field.key} hover>
                  <LabelCell component="th" scope="row">
                    {field.label}
                  </LabelCell>
                  {values.map((value, index) => {
                    const year = sortedYears[index].year;
                    return field.format === 'percentage' ? (
                      <PercentageCell key={year}>
                        {formatValue(Number(value), field.format)}
                      </PercentageCell>
                    ) : (
                      <NumberCell key={year}>
                        {formatValue(Number(value), field.format)}
                      </NumberCell>
                    );
                  })}
                  {showEvolution && values.length > 1 && (
                    <TableCell sx={{ textAlign: 'center', padding: '12px 16px' }}>
                      <Chip
                        label={`${evolution >= 0 ? '+' : ''}${evolution.toFixed(1)}%`}
                        size="small"
                        sx={{
                          bgcolor: getEvolutionColor(evolution),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          fontFamily: '"Roboto Mono", monospace',
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};