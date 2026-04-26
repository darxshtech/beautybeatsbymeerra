"use client";

import styles from '@/styles/components/Table.module.css';

interface TableProps {
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  data: any[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export default function Table({ columns, data, pagination }: TableProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className={styles.tr}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn} 
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span className={styles.pageBtn}>{pagination.page} / {pagination.totalPages}</span>
          <button 
            className={styles.pageBtn} 
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
             Next
          </button>
        </div>
      )}
    </div>
  );
}
