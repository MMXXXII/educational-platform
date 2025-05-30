export function PageSizeSelector({ pageSize, onChange, currentPage, totalItems, itemName = "элементов" }) {
    const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex justify-between items-center mb-6 text-sm text-gray-600 dark:text-gray-300">
            <div>
                {totalItems > 0 && `Показано ${startItem} - ${endItem} из ${totalItems} ${itemName}`}
            </div>
            <div className="flex items-center">
                <label htmlFor="pageSize" className="mr-2">На странице:</label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={onChange}
                    className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                </select>
            </div>
        </div>
    );
}