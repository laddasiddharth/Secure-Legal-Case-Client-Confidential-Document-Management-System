import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'stats' | 'text';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'stats') {
    return (
      <div className="skeleton-stats-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text skeleton-text-lg"></div>
            <div className="skeleton-text skeleton-text-sm"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-text skeleton-text-sm"></div>
          ))}
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="skeleton-text"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="skeleton-text-container">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-text"></div>
        ))}
      </div>
    );
  }

  // Default: card type
  return (
    <div className="skeleton-cards-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-text skeleton-text-lg"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text skeleton-text-sm"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
