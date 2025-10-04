'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// تسجيل المكونات المطلوبة
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface AnalyticsChartProps {
  labels: string[]
  viewsData: number[]
  downloadsData: number[]
  postsData: number[]
}

export default function AnalyticsChart({ labels, viewsData, downloadsData, postsData }: AnalyticsChartProps) {
  const chartRef = useRef<any>(null)

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'المشاهدات',
        data: viewsData,
        borderColor: 'rgb(30, 158, 148)',
        backgroundColor: 'rgba(30, 158, 148, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(30, 158, 148)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'التحميلات',
        data: downloadsData,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'المقالات المنشورة',
        data: postsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          font: {
            family: 'Cairo, sans-serif',
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Cairo, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Cairo, sans-serif',
          size: 13
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('ar-SA')
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          },
          color: '#6b7280',
          callback: function(value: any) {
            return value.toLocaleString('ar-SA')
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '300px' }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  )
}

