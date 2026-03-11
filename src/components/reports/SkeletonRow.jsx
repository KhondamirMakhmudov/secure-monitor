export const SkeletonRow = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-3 rounded shimmer"
          style={{ width: `${55 + ((i * 17) % 40)}%` }}
        />
      </td>
    ))}
  </tr>
);
