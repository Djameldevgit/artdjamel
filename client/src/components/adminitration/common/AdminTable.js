// src/components/administration/common/AdminTable.jsx
import React, { useState } from 'react';
import { Table, Badge, Dropdown, Spinner, Pagination } from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import styles from './AdminTable.css';

const AdminTable = ({
  data,
  columns,
  actions,
  loading,
  pagination,
  onPageChange,
  variant = 'striped',
  size = 'md'
}) => {
  const { t } = useTranslation('admin');
  const [expandedRow, setExpandedRow] = useState(null);

  const renderCellValue = (item, column) => {
    const value = column.accessor ? item[column.accessor] : null;

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'badge') {
      const badgeConfig = column.badgeConfig || {};
      const variant = badgeConfig[value] || 'secondary';
      return <Badge bg={variant}>{value}</Badge>;
    }

    if (column.type === 'image') {
      return <img src={value} alt="avatar" className={styles.avatar} />;
    }

    return value;
  };

  return (
    <div className={styles.tableContainer}>
      <div className="table-responsive">
        <Table striped={variant === 'striped'} hover size={size} className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((column, idx) => (
                <th key={idx} style={{ width: column.width }} className={column.className}>
                  {column.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th style={{ width: '80px' }} className="text-center">
                  {t('actions.label')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">{t('loading')}</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-5">
                  <div className={styles.emptyState}>
                    <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p className="mt-3 text-muted">{t('noData')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <React.Fragment key={item._id || idx}>
                  <tr
                    className={expandedRow === idx ? styles.expandedRow : ''}
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {columns.map((column, colIdx) => (
                      <td key={colIdx} className={column.cellClassName}>
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="text-center">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="link"
                            className={styles.actionToggle}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            {actions.map((action, actionIdx) => (
                              <Dropdown.Item
                                key={actionIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                                className={action.className}
                              >
                                {action.icon && <span className="me-2">{action.icon}</span>}
                                {action.label}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    )}
                  </tr>
                  {expandedRow === idx && item.expandedContent && (
                    <tr className={styles.expandedContentRow}>
                      <td colSpan={columns.length + 1}>
                        <div className={styles.expandedContent}>
                          {item.expandedContent}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination>
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={pagination.currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            />
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === pagination.currentPage}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdminTable;