package controllers

import (
	"github.com/cryptix/goFir"
	"github.com/robfig/revel"
	"github.com/robfig/revel/cache"
	"math"
	"math/rand"
	"strconv"
	"strings"
)

type SimpleFir struct {
	App
}

var defaultInput = []int{0, 0, 0, 1, 2, 3, 0, 0, 0}

func (c SimpleFir) Index() revel.Result {

	var sim *goFir.SimpleFirSim
	if err := cache.Get("simulation", &sim); err != nil {
		revel.WARN.Print("Cache Miss! Computing Default")
		go cache.Set("simulation", goFir.RunSimulation(defaultInput), cache.DEFAULT)
		return c.Render(nil)
	}
	return c.Render(sim)
}

func (c SimpleFir) SetInput(input string) revel.Result {
	if strings.HasPrefix(input, "[") && strings.HasSuffix(input, "]") {
		var newInts []int
		for _, v := range strings.Split(input[1:len(input)-1], " ") {
			i, err := strconv.Atoi(v)
			if err != nil {
				c.Flash.Error("Cant parse int! %v", err)
				return c.Redirect(SimpleFir.Index)
			}
			newInts = append(newInts, i)
		}

		go cache.Set("simulation", goFir.RunSimulation(newInts), cache.DEFAULT)
	} else {
		c.Flash.Error("Invalid input format.")
	}
	return c.Redirect(SimpleFir.Index)
}

func (c SimpleFir) SinInput() revel.Result {
	return c.Render()
}

func (c SimpleFir) SetSinInput(amp, freq float64, valuecnt, noise int) revel.Result {
	arr := make([]int, valuecnt)
	for i := 0; i < valuecnt; i++ {
		arr[i] = int(amp*math.Sin(math.Pi/freq*float64(i))) + rand.Intn(noise)
	}

	go cache.Set("simulation", goFir.RunSimulation(arr), cache.DEFAULT)

	return c.Redirect(SimpleFir.Index)
}

func (c SimpleFir) GetData() revel.Result {

	var simulation *goFir.SimpleFirSim
	if err := cache.Get("simulation", &simulation); err != nil {
		revel.WARN.Print("Cache Miss! Computing Default")
		go cache.Set("simulation", goFir.RunSimulation(defaultInput), cache.DEFAULT)
		return c.Render(nil)
	}

	return c.RenderJson(simulation)
}
