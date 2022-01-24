const getRandomNumber = () => {
  return Math.round(Number.MAX_SAFE_INTEGER * Math.random());
};

const mergeSortedArrays = (arr1, arr2) => {
  let i = 0,
    j = 0;
  const firstLength = arr1.length;
  const secondLength = arr2.length;
  const result = [];

  while (i < firstLength && j < secondLength) {
    const first = arr1[i];
    const second = arr2[j];

    if (first < second) {
      result.push(first);
      i++;
    } else {
      result.push(second);
      j++;
    }
  }

  if (i >= firstLength) {
    result.push(...arr2.slice(j));
  } else if (j >= secondLength) {
    result.push(...arr1.slice(i));
  }

  delete arr1;
  delete arr2;

  return result;
};

const mergeSort = arr => {
  if (arr.length < 2) return arr;

  const center = Math.floor(arr.length / 2);
  const first = arr.slice(0, center);
  const second = arr.slice(center);

  delete arr;

  return mergeSortedArrays(mergeSort(first), mergeSort(second));
};

module.exports = {
  getRandomNumber,
  mergeSortedArrays,
  mergeSort
};
