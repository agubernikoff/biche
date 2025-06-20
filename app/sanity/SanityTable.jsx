import React from 'react';

// Simple table component for basic string cells
export default function SimpleTable({value}) {
  const {caption, headers, rows} = value;

  return (
    <div className="">
      <table className="">
        {caption && <caption className="">{caption}</caption>}

        {headers && headers.length > 0 && (
          <thead>
            <tr className="">
              {headers.map((header, index) => (
                <th key={index} className="">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {rows && rows.length > 0 && (
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="">
                {row.cells &&
                  row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="">
                      {cell || ''}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
