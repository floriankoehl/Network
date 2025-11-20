import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function SelectHeader({change_selection}) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="!bg-white/80 rounded-md shadow-md !w-full !h-full">
        <Box   sx={{ width: '100%' }}>
      <Tabs
        onChange={handleChange}
        value={value}
        aria-label="Tabs where each tab needs to be selected manually"
        className='!flex !gap-3'
      >
            
        <Tab onClick={()=>{change_selection(1)}} className='!bg-green-200' />
        <Tab onClick={()=>{change_selection(2)}}  className='!bg-red-200' />
        <Tab onClick={()=>{change_selection(3)}} className='!bg-blue-200' />
      </Tabs>
    </Box>
    </div>
    
  );
}